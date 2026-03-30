import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

interface Client {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  direccion_default: string | null;
  created_at: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    supabase.from('frozen_clients').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setClients(data || []));
  }, []);

  return (
    <Layout>
      <div className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Clientes</h1>
        <div className="space-y-3">
          {clients.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <p className="font-bold">{c.nombre} {c.apellido}</p>
                <p className="text-sm text-muted-foreground">{c.email} • {c.telefono || 'Sin tel'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registrado: {new Date(c.created_at).toLocaleDateString('es-AR')}
                </p>
              </CardContent>
            </Card>
          ))}
          {clients.length === 0 && <p className="text-muted-foreground">No hay clientes registrados.</p>}
        </div>
      </div>
    </Layout>
  );
}
