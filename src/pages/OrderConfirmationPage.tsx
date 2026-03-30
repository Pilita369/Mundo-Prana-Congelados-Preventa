import { useLocation, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const { total, totalViandas, diasEspera, payMethod, bankInfo, fechaEstimada } = state || {};

  return (
    <Layout>
      <div className="container max-w-lg px-4 py-12 text-center">
        <div className="animate-fade-in">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-secondary" />
          <h1 className="mb-2 text-2xl text-primary">¡Pedido Confirmado!</h1>
          <p className="mb-6 text-muted-foreground">
            {diasEspera === 14
              ? 'Tu pedido es grande — tendrá un tiempo estimado de 14 días hábiles. Si está antes, te avisamos.'
              : 'Tu pedido estará listo en 7 días hábiles. Si está antes, te avisamos.'}
          </p>

          {/* Aviso destacado si son 14 días */}
          {diasEspera === 14 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/20 p-3 text-sm text-left">
              <Clock className="h-5 w-5 text-orange-500 shrink-0" />
              <p className="text-orange-700 dark:text-orange-300">
                <strong>{totalViandas} viandas</strong> — producción grande. Tiempo estimado: <strong>14 días hábiles</strong>.
              </p>
            </div>
          )}

          <Card className="mb-6 text-left">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Viandas</span>
                <span className="font-medium">{totalViandas}</span>
              </div>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiempo de espera</span>
                <span className={`font-bold ${diasEspera === 14 ? 'text-orange-500' : 'text-secondary'}`}>
                  {diasEspera} días hábiles
                </span>
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