import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminConfigPage() {
  const [bankInfo, setBankInfo] = useState('');
  const [basePrice, setBasePrice] = useState('12000');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('frozen_config').select('clave, valor').then(({ data }) => {
      data?.forEach(row => {
        if (row.clave === 'datos_bancarios') setBankInfo(row.valor);
        if (row.clave === 'precio_base') setBasePrice(row.valor);
      });
    });
  }, []);

  const save = async () => {
    setLoading(true);
    await supabase.from('frozen_config').update({ valor: bankInfo }).eq('clave', 'datos_bancarios');
    await supabase.from('frozen_config').update({ valor: basePrice }).eq('clave', 'precio_base');
    toast.success('Configuración guardada');
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Configuración</h1>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <Label className="font-bold">Datos bancarios para transferencia</Label>
              <Textarea rows={5} value={bankInfo} onChange={e => setBankInfo(e.target.value)} placeholder="CBU, Alias, Titular..." />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <Label className="font-bold">Precio base por vianda ($)</Label>
              <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)}
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </CardContent>
          </Card>

          <Button onClick={save} disabled={loading} className="w-full">
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
