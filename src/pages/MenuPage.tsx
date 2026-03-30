import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatCurrency';

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
  orden: number;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('frozen_menu_items')
      .select('*')
      .eq('activo', true)
      .order('orden')
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="container max-w-4xl py-8 px-4">
        <h1 className="mb-2 text-3xl text-primary">Nuestro Menú</h1>
        <p className="mb-8 text-muted-foreground">Viandas congeladas listas para calentar y disfrutar</p>
        
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, i) => (
              <Card key={item.id} className="animate-fade-in transition-shadow hover:shadow-md" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-tight mb-1">{item.nombre}</h3>
                      {item.descripcion && item.descripcion !== item.nombre && (
                        <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-bold text-secondary">{formatCurrency(item.precio)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
