import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

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
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', direccion_default: '' });
  const [saving, setSaving] = useState(false);

  const fetchClients = () => {
    supabase.from('frozen_clients').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setClients(data || []));
  };

  useEffect(() => { fetchClients(); }, []);

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      nombre: client.nombre,
      apellido: client.apellido,
      telefono: client.telefono || '',
      direccion_default: client.direccion_default || '',
    });
  };

  const handleSave = async () => {
    if (!editingClient) return;
    if (!form.nombre.trim() || !form.apellido.trim()) {
      toast.error('El nombre y apellido son obligatorios');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('frozen_clients')
      .update({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim() || null,
        direccion_default: form.direccion_default.trim() || null,
      })
      .eq('id', editingClient.id);

    if (error) {
      toast.error('No se pudo guardar los cambios');
    } else {
      toast.success('Cliente actualizado');
      setEditingClient(null);
      fetchClients();
    }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl text-primary">Clientes</h1>
        <div className="space-y-3">
          {clients.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold">{c.nombre} {c.apellido}</p>
                    <p className="text-sm text-muted-foreground">{c.email} • {c.telefono || 'Sin tel'}</p>
                    {c.direccion_default && (
                      <p className="text-xs text-muted-foreground mt-0.5">📍 {c.direccion_default}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Registrado: {new Date(c.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {clients.length === 0 && <p className="text-muted-foreground">No hay clientes registrados.</p>}
        </div>
      </div>

      {/* Modal de edición */}
      <Dialog open={!!editingClient} onOpenChange={(open) => { if (!open) setEditingClient(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={form.apellido}
                  onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                placeholder="Ej: 299 1234567"
              />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección por defecto</Label>
              <Input
                id="direccion"
                value={form.direccion_default}
                onChange={e => setForm(f => ({ ...f, direccion_default: e.target.value }))}
                placeholder="Calle, número, localidad"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El email no se puede modificar desde acá (lo gestiona el sistema de autenticación).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClient(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}