import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      toast.error('Email o contraseña incorrectos');
      return;
    }

    // Buscar el rol del usuario
    const { data: roleData } = await supabase
      .from('frozen_user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle();

    setLoading(false);
    toast.success('¡Bienvenido/a!');

    // Redirigir según el rol
    const role = roleData?.role;
    if (role === 'superadmin') {
      navigate('/admin');
    } else if (role === 'admin_adjunto') {
      navigate('/natalia');
    } else {
      navigate('/pedido/nuevo');
    }
  };

  return (
    <Layout>
      <div className="container flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <img src="/logo.cuchara.webp" alt="Mundo Prana" className="mx-auto mb-2 h-16 w-16 rounded-full" />
            <CardTitle className="text-2xl text-primary">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="text-primary font-medium hover:underline">Registrate</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}