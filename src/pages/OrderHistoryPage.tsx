import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import { Pencil, Minus, Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  nombre: string;
  precio: number;
}

interface OrderItem {
  id: string;
  cantidad: number;
  precio_unitario: number;
  menu_item_id: string;
  frozen_menu_items: { nombre: string } | null;
}

interface OrderWithItems {
  id: string;
  total: number;
  estado: string;
  metodo_pago: string;
  necesita_envio: boolean;
  direccion_envio: string | null;
  fecha_pedido: string;
  fecha_estimada: string | null;
  comentarios: string | null;
  frozen_order_items: OrderItem[];
}

// Calcula días hábiles igual que en NewOrderPage
function sumarDiasHabiles(fecha: Date, dias: number): Date {
  const result = new Date(fecha);
  let contados = 0;
  while (contados < dias) {
    result.setDate(result.getDate() + 1);
    const dia = result.getDay();
    if (dia !== 0 && dia !== 6) contados++;
  }
  return result;
}

function calcularDiasEspera(totalViandas: number): number {
  return totalViandas <= 30 ? 7 : 14;
}

export default function OrderHistoryPage() {
  const { clientId } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del modal de edición
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [payMethod, setPayMethod] = useState('efectivo');
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    if (!clientId) return;
    supabase
      .from('frozen_orders')
      .select('*, frozen_order_items(id, cantidad, precio_unitario, menu_item_id, frozen_menu_items(nombre))')
      .eq('client_id', clientId)
      .order('fecha_pedido', { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as OrderWithItems[]) || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchOrders(); }, [clientId]);

  const openEdit = async (order: OrderWithItems) => {
    // Cargar menú activo si no está cargado
    if (menuItems.length === 0) {
      const { data } = await supabase
        .from('frozen_menu_items')
        .select('id, nombre, precio')
        .eq('activo', true)
        .order('orden');
      setMenuItems(data || []);
    }

    // Inicializar cantidades con lo que tiene el pedido
    const qtys: Record<string, number> = {};
    order.frozen_order_items.forEach(oi => {
      qtys[oi.menu_item_id] = oi.cantidad;
    });

    setQuantities(qtys);
    setPayMethod(order.metodo_pago);
    setNeedsDelivery(order.necesita_envio);
    setAddress(order.direccion_envio || '');
    setComments(order.comentarios || '');
    setEditingOrder(order);
  };

  const setQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const val = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: val };
    });
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSave = async () => {
    if (!editingOrder) return;
    if (totalItems === 0) {
      toast.error('El pedido debe tener al menos una vianda');
      return;
    }
    if (needsDelivery && !address.trim()) {
      toast.error('Ingresá la dirección de envío');
      return;
    }

    setSaving(true);

    // Recalcular total y fecha estimada
    const newTotal = menuItems.reduce(
      (sum, item) => sum + (quantities[item.id] || 0) * item.precio,
      0
    );
    const dias = calcularDiasEspera(totalItems);
    const fechaEstimada = sumarDiasHabiles(new Date(), dias);

    // 1. Actualizar el pedido
    const { error: orderError } = await supabase
      .from('frozen_orders')
      .update({
        total: newTotal,
        metodo_pago: payMethod,
        necesita_envio: needsDelivery,
        direccion_envio: needsDelivery ? address.trim() : null,
        comentarios: comments.trim() || null,
        fecha_estimada: fechaEstimada.toISOString(),
      })
      .eq('id', editingOrder.id);

    if (orderError) {
      toast.error('No se pudo guardar el pedido');
      setSaving(false);
      return;
    }

    // 2. Borrar todos los items viejos y reinsertar los nuevos
    await supabase.from('frozen_order_items').delete().eq('order_id', editingOrder.id);

    const newItems = menuItems
      .filter(item => (quantities[item.id] || 0) > 0)
      .map(item => ({
        order_id: editingOrder.id,
        menu_item_id: item.id,
        cantidad: quantities[item.id],
        precio_unitario: item.precio,
      }));

    await supabase.from('frozen_order_items').insert(newItems);

    toast.success('¡Pedido actualizado!');
    setEditingOrder(null);
    fetchOrders();
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Mis Pedidos</h1>

        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">Todavía no hiciste ningún pedido.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.fecha_pedido).toLocaleDateString('es-AR')}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge estado={order.estado} />
                      {order.estado === 'pendiente' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(order)}
                          title="Editar pedido"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <ul className="mb-3 space-y-1 text-sm">
                    {order.frozen_order_items.map((oi, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{oi.cantidad}x {oi.frozen_menu_items?.nombre || 'Ítem'}</span>
                        <span className="text-muted-foreground">{formatCurrency(oi.cantidad * oi.precio_unitario)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground capitalize">
                      {order.metodo_pago} {order.necesita_envio ? '• Con envío' : ''}
                    </span>
                    <span className="font-extrabold text-primary">{formatCurrency(order.total)}</span>
                  </div>
                  {order.fecha_estimada && order.estado !== 'entregado' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Estimado: {new Date(order.fecha_estimada).toLocaleDateString('es-AR')}
                    </p>
                  )}
                  {order.estado === 'pendiente' && (
                    <p className="mt-1 text-xs text-secondary font-medium">
                      ✏️ Podés editar este pedido mientras esté pendiente
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => { if (!open) setEditingOrder(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Cantidades */}
            <div>
              <p className="text-sm font-bold mb-3">Viandas</p>
              <div className="space-y-2">
                {menuItems.map(item => {
                  const qty = quantities[item.id] || 0;
                  return (
                    <div key={item.id} className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${qty > 0 ? 'border-secondary bg-secondary/5' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.nombre}</p>
                        <p className="text-xs text-secondary font-bold">{formatCurrency(item.precio)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setQty(item.id, -1)}
                          disabled={qty === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{qty}</span>
                        <button
                          onClick={() => setQty(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalItems > 0 && (
                <p className="mt-2 text-xs text-muted-foreground text-right">
                  {totalItems} vianda{totalItems > 1 ? 's' : ''} — tiempo estimado: {calcularDiasEspera(totalItems)} días hábiles
                </p>
              )}
            </div>

            {/* Envío */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-delivery" className="font-bold">¿Necesitás envío a domicilio?</Label>
                <Switch id="edit-delivery" checked={needsDelivery} onCheckedChange={setNeedsDelivery} />
              </div>
              {needsDelivery && (
                <div>
                  <Label htmlFor="edit-address">Dirección completa</Label>
                  <Input
                    id="edit-address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Calle, número, piso, localidad"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Pago */}
            <div className="rounded-lg border p-4 space-y-3">
              <Label className="font-bold">Método de pago</Label>
              <RadioGroup value={payMethod} onValueChange={setPayMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="efectivo" id="edit-efectivo" />
                  <Label htmlFor="edit-efectivo">Efectivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transferencia" id="edit-transferencia" />
                  <Label htmlFor="edit-transferencia">Transferencia bancaria</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Comentarios */}
            <div>
              <Label htmlFor="edit-comments" className="font-bold">Comentarios</Label>
              <Textarea
                id="edit-comments"
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Alergias, preferencias, aclaraciones..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || totalItems === 0}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}