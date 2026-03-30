import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';

const ESTADOS = ['pendiente', 'en preparación', 'listo', 'entregado'];

interface DeliveryOrder {
  id: string;
  estado: string;
  direccion_envio: string | null;
  frozen_clients: { nombre: string; apellido: string; telefono: string | null } | null;
  frozen_order_items: { cantidad: number; frozen_menu_items: { nombre: string } | null }[];
}

export default function AdminDeliveriesPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  const fetchDeliveries = () => {
    supabase
      .from('frozen_orders')
      .select('id, estado, direccion_envio, frozen_clients(nombre, apellido, telefono), frozen_order_items(cantidad, frozen_menu_items(nombre))')
      .eq('necesita_envio', true)
      .in('estado', ['pendiente', 'en preparación', 'listo'])
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as unknown as DeliveryOrder[]) || []));
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const changeStatus = async (id: string, status: string) => {
    await supabase.from('frozen_orders').update({ estado: status }).eq('id', id);
    toast.success('Estado actualizado');
    fetchDeliveries();
  };

  return (
    <Layout>
      <div className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary flex items-center gap-2"><Truck className="h-6 w-6" />Repartos</h1>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">No hay pedidos con envío pendientes.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <Card key={o.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold">{o.frozen_clients?.nombre} {o.frozen_clients?.apellido}</p>
                      <p className="text-xs text-muted-foreground">{o.frozen_clients?.telefono || 'Sin tel'}</p>
                    </div>
                    <StatusBadge estado={o.estado} />
                  </div>
                  <p className="text-sm mb-2">📍 {o.direccion_envio}</p>
                  <ul className="text-sm text-muted-foreground mb-3">
                    {o.frozen_order_items.map((oi, i) => (
                      <li key={i}>{oi.cantidad}x {oi.frozen_menu_items?.nombre}</li>
                    ))}
                  </ul>
                  <Select value={o.estado} onValueChange={v => changeStatus(o.id, v)}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
