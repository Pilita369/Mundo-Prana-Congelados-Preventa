import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
  orden: number;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('12000');

  const fetchItems = () => {
    supabase.from('frozen_menu_items').select('*').order('orden')
      .then(({ data }) => setItems(data || []));
  };

  useEffect(() => { fetchItems(); }, []);

  const toggleActive = async (id: string, activo: boolean) => {
    await supabase.from('frozen_menu_items').update({ activo: !activo }).eq('id', id);
    toast.success('Actualizado');
    fetchItems();
  };

  const updatePrice = async (id: string, precio: number) => {
    await supabase.from('frozen_menu_items').update({ precio }).eq('id', id);
    toast.success('Precio actualizado');
  };

  const addItem = async () => {
    if (!newName.trim()) return;
    const maxOrden = items.length > 0 ? Math.max(...items.map(i => i.orden)) + 1 : 1;
    await supabase.from('frozen_menu_items').insert({
      nombre: newName.trim(),
      descripcion: newName.trim(),
      precio: Number(newPrice) || 12000,
      activo: true,
      orden: maxOrden,
    });
    setNewName('');
    setNewPrice('12000');
    toast.success('Ítem agregado');
    fetchItems();
  };

  return (
    <Layout>
      <div className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Gestión del Menú</h1>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Label className="font-bold">Agregar nuevo ítem</Label>
            <Input placeholder="Nombre del plato" value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="flex gap-3">
              <Input type="number" placeholder="Precio" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-32" />
              <Button onClick={addItem}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id} className={!item.activo ? 'opacity-50' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <Switch checked={item.activo} onCheckedChange={() => toggleActive(item.id, item.activo)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.nombre}</p>
                </div>
                <Input
                  type="number"
                  defaultValue={item.precio}
                  className="w-28"
                  onBlur={e => updatePrice(item.id, Number(e.target.value))}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
