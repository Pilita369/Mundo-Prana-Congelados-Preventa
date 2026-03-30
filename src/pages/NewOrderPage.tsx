import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  nombre: string;
  precio: number;
}

export default function NewOrderPage() {
  const { clientId } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [address, setAddress] = useState('');
  const [payMethod, setPayMethod] = useState('efectivo');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState('');

  useEffect(() => {
    supabase.from('frozen_menu_items').select('id, nombre, precio').eq('activo', true).order('orden')
      .then(({ data }) => setItems(data || []));
    supabase.from('frozen_config').select('valor').eq('clave', 'datos_bancarios').maybeSingle()
      .then(({ data }) => setBankInfo(data?.valor || ''));
  }, []);

  const setQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const val = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: val };
    });
  };

  const total = items.reduce((sum, item) => sum + (quantities[item.id] || 0) * item.precio, 0);
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (totalItems === 0) { toast.error('Seleccioná al menos una vianda'); return; }
    if (needsDelivery && !address.trim()) { toast.error('Ingresá la dirección de envío'); return; }
    if (!clientId) { toast.error('Error: no se encontró tu perfil de cliente'); return; }

    setLoading(true);
    const fechaEstimada = new Date();
    let diasHabiles = 7;
    while (diasHabiles > 0) {
      fechaEstimada.setDate(fechaEstimada.getDate() + 1);
      if (fechaEstimada.getDay() !== 0 && fechaEstimada.getDay() !== 6) diasHabiles--;
    }

    const { data: order, error } = await supabase.from('frozen_orders').insert({
      client_id: clientId,
      total,
      metodo_pago: payMethod,
      necesita_envio: needsDelivery,
      direccion_envio: needsDelivery ? address : null,
      comentarios: comments || null,
      estado: 'pendiente',
      fecha_estimada: fechaEstimada.toISOString(),
    }).select('id').single();

    if (error || !order) {
      toast.error('Error al crear el pedido');
      setLoading(false);
      return;
    }

    const orderItems = items
      .filter(item => (quantities[item.id] || 0) > 0)
      .map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        cantidad: quantities[item.id],
        precio_unitario: item.precio,
      }));

    await supabase.from('frozen_order_items').insert(orderItems);
    setLoading(false);
    toast.success('¡Pedido confirmado!');
    navigate('/pedido/confirmacion', { state: { orderId: order.id, total, payMethod, bankInfo, fechaEstimada: fechaEstimada.toLocaleDateString('es-AR') } });
  };

  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-6 pb-28">
        <h1 className="mb-6 text-2xl text-primary">Hacer Pedido</h1>

        <div className="space-y-3 mb-6">
          {items.map(item => {
            const qty = quantities[item.id] || 0;
            return (
              <Card key={item.id} className={`transition-all ${qty > 0 ? 'ring-2 ring-secondary' : ''}`}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight">{item.nombre}</p>
                    <p className="text-xs text-secondary font-bold">{formatCurrency(item.precio)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setQty(item.id, -1)} disabled={qty === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted disabled:opacity-30">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold">{qty}</span>
                    <button onClick={() => setQty(item.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Delivery */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="delivery" className="font-bold">¿Necesitás envío a domicilio?</Label>
              <Switch id="delivery" checked={needsDelivery} onCheckedChange={setNeedsDelivery} />
            </div>
            {needsDelivery && (
              <div>
                <Label htmlFor="address">Dirección completa</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, piso, localidad" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <Label className="font-bold">Método de pago</Label>
            <RadioGroup value={payMethod} onValueChange={setPayMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo">Efectivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia">Transferencia bancaria</Label>
              </div>
            </RadioGroup>
            {payMethod === 'transferencia' && bankInfo && (
              <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-line">
                <p className="font-bold mb-1">Datos para transferir:</p>
                {bankInfo}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Label htmlFor="comments" className="font-bold">Comentarios (opcional)</Label>
            <Textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} placeholder="Alergias, preferencias, aclaraciones..." className="mt-2" />
          </CardContent>
        </Card>

        {/* Floating footer */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4 shadow-lg z-50">
            <div className="container max-w-2xl flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{totalItems} vianda{totalItems > 1 ? 's' : ''}</p>
                <p className="text-xl font-extrabold text-primary">{formatCurrency(total)}</p>
              </div>
              <Button size="lg" onClick={handleSubmit} disabled={loading} className="bg-secondary hover:bg-secondary/90 font-bold">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {loading ? 'Enviando...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
