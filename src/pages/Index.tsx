import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Leaf, ShoppingCart, Truck, Heart } from 'lucide-react';

export default function Index() {
  const { user, role } = useAuth();

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero py-20 px-4 text-center">
        <div className="container max-w-3xl animate-fade-in">
          <img src="/logo.cuchara.webp" alt="Mundo Prana" className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-secondary shadow-lg" />
          <h1 className="mb-4 text-4xl font-extrabold text-primary-foreground md:text-5xl">
            Mundo Prana
          </h1>
          <p className="mb-2 text-xl text-primary-foreground/90 font-heading">
            Viandas congeladas saludables
          </p>
          <p className="mb-8 text-primary-foreground/75">
            Comida casera, nutritiva y lista para disfrutar. Pedí tus viandas y recibilas en tu casa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
              <Link to="/menu">Ver Menú</Link>
            </Button>
            {user && role === 'cliente' ? (
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                <Link to="/pedido/nuevo">Hacer Pedido</Link>
              </Button>
            ) : !user ? (
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                <Link to="/registro">Registrarse</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Leaf, title: 'Saludable', desc: 'Ingredientes frescos y naturales' },
              { icon: Heart, title: 'Casero', desc: 'Preparado con amor y dedicación' },
              { icon: ShoppingCart, title: 'Fácil', desc: 'Pedí online en minutos' },
              { icon: Truck, title: 'Envío', desc: 'Lo llevamos a tu domicilio' },
            ].map((f) => (
              <div key={f.title} className="text-center animate-fade-in">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15">
                  <f.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="mb-1 font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}