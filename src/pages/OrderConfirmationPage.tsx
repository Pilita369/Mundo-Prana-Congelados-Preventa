import { useLocation, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const { total, payMethod, bankInfo, fechaEstimada } = state || {};

  return (
    <Layout>
      <div className="container max-w-lg px-4 py-12 text-center">
        <div className="animate-fade-in">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-secondary" />
          <h1 className="mb-2 text-2xl text-primary">¡Pedido Confirmado!</h1>
          <p className="mb-6 text-muted-foreground">
            Tu pedido estará listo en 7 días hábiles. Si está antes, te avisamos.
          </p>

          <Card className="mb-6 text-left">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-extrabold text-primary">{formatCurrency(total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de pago</span>
                <span className="font-medium capitalize">{payMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha estimada</span>
                <span className="font-medium">{fechaEstimada}</span>
              </div>
              {payMethod === 'transferencia' && bankInfo && (
                <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-line">
                  <p className="font-bold mb-1">Datos para transferir:</p>
                  {bankInfo}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/pedido/historial">Ver Mis Pedidos</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Volver al Inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
