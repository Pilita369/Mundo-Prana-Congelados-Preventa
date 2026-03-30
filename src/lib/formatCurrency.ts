export function formatCurrency(amount: number): string {
  return '$ ' + amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
