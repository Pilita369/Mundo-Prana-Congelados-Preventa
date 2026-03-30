import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Truck, Users, Settings, UtensilsCrossed } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pendiente: 0, 'en preparación': 0, listo: 0, entregado: 0 });

  useEffect(() => {
    supabase.from('frozen_orders').select('estado').then(({ data }) => {
      const s = { pendiente: 0, 'en preparación': 0, listo: 0, entregado: 0 };
      data?.forEach(o => { if (o.estado in s) s[o.estado as keyof typeof s]++; });
      setStats(s);
    });
  }, []);

  const links = [
    { to: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos', color: 'text-primary' },
    { to: '/admin/repartos', icon: Truck, label: 'Repartos', color: 'text-secondary' },
    { to: '/admin/clientes', icon: Users, label: 'Clientes', color: 'text-primary' },
    { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menú', color: 'text-secondary' },
    { to: '/admin/configuracion', icon: Settings, label: 'Configuración', color: 'text-primary' },
  ];

  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Panel Superadmin</h1>

        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          {Object.entries(stats).map(([key, val]) => (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-extrabold text-primary">{val}</p>
                <p className="text-xs text-muted-foreground capitalize">{key}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(l => (
            <Link key={l.to} to={l.to}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center gap-3 p-5">
                  <l.icon className={`h-8 w-8 ${l.color}`} />
                  <span className="font-bold">{l.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
