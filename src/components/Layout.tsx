import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/50 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Mundo Prana — Viandas congeladas saludables</p>
      </footer>
    </div>
  );
}
