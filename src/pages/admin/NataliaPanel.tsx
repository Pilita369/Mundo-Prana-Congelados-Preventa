import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Truck } from 'lucide-react';

export default function NataliaPanel() {
  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Panel — Natalia</h1>
        <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </Layout>
  );
}
