import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterEstado, setFilterEstado] = useState('todos');

  const fetchOrders = () => {
    let q = supabase
      .from('frozen_orders')
      .select('*, frozen_clients(nombre, apellido, telefono), frozen_order_items(cantidad, frozen_menu_items(nombre))')
      .order('fecha_pedido', { ascending: false });
    if (filterEstado !== 'todos') q = q.eq('estado', filterEstado);
    q.then(({ data }) => setOrders((data as unknown as Order[]) || []));
  };

  useEffect(() => { fetchOrders(); }, [filterEstado]);

  const changeStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('frozen_orders').update({ estado: newStatus }).eq('id', orderId);
    toast.success(`Estado actualizado a "${newStatus}"`);
    fetchOrders();
  };

  const deleteOrder = async (orderId: string) => {
    // Primero borramos los items del pedido (por FK)
    await supabase.from('frozen_order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('frozen_orders').delete().eq('id', orderId);
    if (error) {
      toast.error('No se pudo borrar el pedido');
    } else {
      toast.success('Pedido eliminado');
      fetchOrders();
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-primary">Pedidos</h1>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {ESTADOS.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Borrar pedido?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Vas a eliminar el pedido de <strong>{order.frozen_clients?.nombre} {order.frozen_clients?.apellido}</strong> por {formatCurrency(order.total)}. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteOrder(order.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sí, borrar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <ul className="mb-3 text-sm space-y-0.5">
                  {order.frozen_order_items.map((oi, i) => (
                    <li key={i}>{oi.cantidad}x {oi.frozen_menu_items?.nombre}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{order.metodo_pago} {order.necesita_envio ? '• Envío' : '• Retira'}</span>
                  <span className="font-extrabold text-primary">{formatCurrency(order.total)}</span>
                </div>
                {order.direccion_envio && (
                  <p className="mt-1 text-xs text-muted-foreground">📍 {order.direccion_envio}</p>
                )}
                {order.comentarios && (
                  <p className="mt-1 text-xs text-muted-foreground italic">💬 {order.comentarios}</p>
                )}
                <div className="mt-3">
                  <Select value={order.estado} onValueChange={(v) => changeStatus(order.id, v)}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No hay pedidos.</p>}
        </div>
      </div>
    </Layout>
  );
}