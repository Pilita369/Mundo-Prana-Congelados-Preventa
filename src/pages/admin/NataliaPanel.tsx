import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClipboardList, Truck, Pencil } from 'lucide-react';

const ESTADOS = ['pendiente', 'en preparación', 'listo', 'entregado'];

interface Order {
  id: string;
  total: number;
  estado: string;
  metodo_pago: string;
  necesita_envio: boolean;
  direccion_envio: string | null;
  comentarios: string | null;
  fecha_pedido: string;
  frozen_clients: { nombre: string; apellido: string; telefono: string | null } | null;
  frozen_order_items: { cantidad: number; frozen_menu_items: { nombre: string } | null }[];
}

export default function NataliaPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newEstado, setNewEstado] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    supabase
      .from('frozen_orders')
      .select('*, frozen_clients(nombre, apellido, telefono), frozen_order_items(cantidad, frozen_menu_items(nombre))')
      .order('fecha_pedido', { ascending: false })
      .then(({ data }) => setOrders((data as unknown as Order[]) || []));
  };

  useEffect(() => { fetchOrders(); }, []);

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setNewEstado(order.estado);
  };

  const handleSave = async () => {
    if (!editingOrder) return;
    setSaving(true);
    const { error } = await supabase
      .from('frozen_orders')
      .update({ estado: newEstado })
      .eq('id', editingOrder.id);

    if (error) {
      toast.error('No se pudo actualizar el estado');
    } else {
      toast.success(`Estado actualizado a "${newEstado}"`);
      setEditingOrder(null);
      fetchOrders();
    }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Panel — Natalia</h1>

        {/* Accesos rápidos */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Link to="/admin/pedidos">
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <ClipboardList className="h-8 w-8 text-primary" />
                <span className="font-bold">Ver Pedidos</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/repartos">
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <Truck className="h-8 w-8 text-secondary" />
                <span className="font-bold">Repartos</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Lista de pedidos con botón editar */}
        <h2 className="text-lg font-bold mb-4 text-primary">Todos los pedidos</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="animate-fade-in">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <p className="font-bold">{order.frozen_clients?.nombre} {order.frozen_clients?.apellido}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.fecha_pedido).toLocaleDateString('es-AR')} • {order.frozen_clients?.telefono || 'Sin tel'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge estado={order.estado} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEdit(order)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ul className="mb-2 text-sm space-y-0.5">
                  {order.frozen_order_items.map((oi, i) => (
                    <li key={i}>{oi.cantidad}x {oi.frozen_menu_items?.nombre}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">
                    {order.metodo_pago} {order.necesita_envio ? '• Envío' : '• Retira'}
                  </span>
                  <span className="font-extrabold text-primary">{formatCurrency(order.total)}</span>
                </div>
                {order.direccion_envio && (
                  <p className="mt-1 text-xs text-muted-foreground">📍 {order.direccion_envio}</p>
                )}
                {order.comentarios && (
                  <p className="mt-1 text-xs text-muted-foreground italic">💬 {order.comentarios}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No hay pedidos.</p>}
        </div>
      </div>

      {/* Modal de edición de estado */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => { if (!open) setEditingOrder(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar estado del pedido</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Pedido de <strong>{editingOrder?.frozen_clients?.nombre} {editingOrder?.frozen_clients?.apellido}</strong>
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={newEstado} onValueChange={setNewEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map(e => (
                    <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}