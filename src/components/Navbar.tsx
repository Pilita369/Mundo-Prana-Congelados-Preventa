import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Forzar reload completo para limpiar todo el estado
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.cuchara.webp" alt="Mundo Prana" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-heading text-lg font-bold text-primary">Mundo Prana</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/menu" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Menú</Link>
          {user && role === 'cliente' && (
            <>
              <Link to="/pedido/nuevo" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Hacer Pedido</Link>
              <Link to="/pedido/historial" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Mis Pedidos</Link>
            </>
          )}
          {user && (role === 'superadmin' || role === 'admin_adjunto') && (
            <Link to={role === 'superadmin' ? '/admin' : '/natalia'} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <LayoutDashboard className="inline h-4 w-4 mr-1" />Panel
            </Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Ingresar</Button>
              <Button size="sm" onClick={() => navigate('/registro')}>Registrarse</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-card p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link to="/menu" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Menú</Link>
            {user && role === 'cliente' && (
              <>
                <Link to="/pedido/nuevo" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Hacer Pedido</Link>
                <Link to="/pedido/historial" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Mis Pedidos</Link>
              </>
            )}
            {user && (role === 'superadmin' || role === 'admin_adjunto') && (
              <Link to={role === 'superadmin' ? '/admin' : '/natalia'} onClick={() => setMenuOpen(false)} className="text-sm font-medium">Panel Admin</Link>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setMenuOpen(false); }}>
                <LogOut className="h-4 w-4 mr-1" />Salir
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Ingresar</Button>
                <Button size="sm" onClick={() => { navigate('/registro'); setMenuOpen(false); }}>Registrarse</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}