import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';

interface OrderWithItems {
  id: string;
  total: number;
  estado: string;
  metodo_pago: string;
  necesita_envio: boolean;
  fecha_pedido: string;
  fecha_estimada: string | null;
  comentarios: string | null;
  frozen_order_items: { cantidad: number; precio_unitario: number; frozen_menu_items: { nombre: string } | null }[];
}

export default function OrderHistoryPage() {
  const { clientId } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    supabase
      .from('frozen_orders')
      .select('*, frozen_order_items(cantidad, precio_unitario, frozen_menu_items(nombre))')
      .eq('client_id', clientId)
      .order('fecha_pedido', { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as OrderWithItems[]) || []);
        setLoading(false);
      });
  }, [clientId]);

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
                    <StatusBadge estado={order.estado} />
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
                    <span className="text-sm text-muted-foreground capitalize">{order.metodo_pago} {order.necesita_envio ? '• Con envío' : ''}</span>
                    <span className="font-extrabold text-primary">{formatCurrency(order.total)}</span>
                  </div>
                  {order.fecha_estimada && order.estado !== 'entregado' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Estimado: {new Date(order.fecha_estimada).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
