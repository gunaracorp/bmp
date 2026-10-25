/**
 * Quote math — kalkulasi murni tanpa dependensi server (aman di client).
 */
export const INSTALLATION_RATE = 0.12;
export const INSTALLATION_MIN_FEE = 1_500_000;

/** Estimasi jasa instalasi: 12% dari subtotal, minimum Rp 1.500.000. */
export function estimateInstallationFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return Math.max(INSTALLATION_MIN_FEE, Math.round(subtotal * INSTALLATION_RATE));
}

export function formatQuoteCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}
