import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'en preparación': { label: 'En preparación', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  listo: { label: 'Listo', className: 'bg-green-100 text-green-800 border-green-200' },
  entregado: { label: 'Entregado', className: 'bg-muted text-muted-foreground' },
};

export default function StatusBadge({ estado }: { estado: string }) {
  const config = statusConfig[estado] || statusConfig.pendiente;
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}
