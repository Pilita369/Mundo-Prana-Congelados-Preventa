import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('¡Registro exitoso! Revisá tu email para confirmar la cuenta.');
      navigate('/login');
    }
  };

  return (
    <Layout>
      <div className="container flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <img src="/logo.cuchara.webp" alt="Mundo Prana" className="mx-auto mb-2 h-16 w-16 rounded-full" />
            <CardTitle className="text-2xl text-primary">Crear Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" required value={form.nombre} onChange={e => update('nombre', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" required value={form.apellido} onChange={e => update('apellido', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" type="tel" value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="Ej: 11-2345-6789" />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Iniciá sesión</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
