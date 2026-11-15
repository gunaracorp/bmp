/**
 * WhatsApp message generator — format pesan penjualan B2B BMP.
 * Semua CTA WhatsApp (lead modal, quote, rekomendasi) memakai modul ini
 * agar format pesan konsisten dan mudah diubah di satu tempat.
 */

export const BMP_WA_NUMBER = '6281350003423';
export const BMP_WA_DISPLAY = '+62 813-5000-3423';

export type LeadWhatsAppPayload = {
  name: string;
  company?: string;
  city?: string;
  needType?: string;
  productName?: string;
  quantity?: number;
  estimate?: number;
  needInstallation?: boolean;
  notes?: string;
  productUrl?: string;
  source?: 'ai-finder' | 'quote' | 'product' | 'contact' | 'compare';
};

function rupiah(value?: number) {
  if (!value || value <= 0) return null;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

const SOURCE_LABEL: Record<string, string> = {
  'ai-finder': 'AI Product Finder',
  quote: 'Quote Builder',
  product: 'Halaman Produk',
  contact: 'Konsultasi',
  compare: 'Perbandingan Produk',
};

/** Susun pesan WhatsApp terformat untuk sales BMP. */
export function generateWhatsAppMessage(payload: LeadWhatsAppPayload): string {
  const lines: string[] = [];
  lines.push('Halo Berkat Mandiri Pendingin, saya ingin konsultasi kebutuhan pendingin.');
  lines.push('');
  lines.push(`Nama: ${payload.name}`);
  if (payload.company) lines.push(`Perusahaan: ${payload.company}`);
  if (payload.city) lines.push(`Lokasi proyek: ${payload.city}`);
  if (payload.needType) lines.push(`Kebutuhan: ${payload.needType}`);
  if (payload.productName) {
    lines.push(`Model diminati: ${payload.productName}`);
    if (payload.quantity && payload.quantity > 1) lines.push(`Jumlah: ${payload.quantity} unit`);
  }
  const estimate = rupiah(payload.estimate);
  if (estimate) lines.push(`Estimasi: ${estimate}`);
  if (payload.needInstallation !== undefined) {
    lines.push(`Kebutuhan instalasi: ${payload.needInstallation ? 'Ya, perlu jasa instalasi' : 'Tidak, supply saja'}`);
  }
  if (payload.notes) lines.push(`Catatan: ${payload.notes}`);
  if (payload.source) lines.push(`Sumber: ${SOURCE_LABEL[payload.source] ?? payload.source}`);
  if (payload.productUrl) lines.push(`Referensi: ${payload.productUrl}`);
  lines.push('');
  lines.push('Mohon info harga terbaik dan lead time-nya. Terima kasih.');
  return lines.join('\n');
}

/** Bangun URL wa.me dari pesan yang sudah terformat. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BMP_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Helper kombinasi: pesan + URL sekaligus. */
export function generateLeadWhatsApp(payload: LeadWhatsAppPayload): { message: string; url: string } {
  const message = generateWhatsAppMessage(payload);
  return { message, url: buildWhatsAppUrl(message) };
}
