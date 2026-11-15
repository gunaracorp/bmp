/**
 * KEBIJAKAN HARGA BMP — sumber kebenaran tunggal.
 *
 * Mode 'whatsapp' (aktif):
 *   • Tidak ada harga yang ditampilkan di seluruh website.
 *   • Semua permintaan harga diarahkan langsung ke WhatsApp sales dengan
 *     pesan terformat (nama produk, brand, model, dan URL referensi).
 *
 * Mode 'public' (jika suatu saat diaktifkan kembali):
 *   • Harga tampil normal di katalog, detail, keranjang, dan JSON-LD Offer.
 *
 * Cukup ubah konstanta di bawah untuk membalik kebijakan seluruh situs.
 */
import { BMP_WA_NUMBER } from '@/lib/wa-message';

export const PRICING_MODE: 'whatsapp' | 'public' = 'whatsapp';

/** Apakah harga boleh ditampilkan publik? */
export function isPricingPublic(): boolean {
  return PRICING_MODE === 'public';
}

export type PriceInquiryTarget = {
  name: string;
  brand?: string | null;
  model?: string | null;
  slug?: string | null;
  siteUrl?: string;
};

/** Susun pesan WhatsApp permintaan harga yang sopan dan informatif. */
export function buildPriceInquiryMessage(target: PriceInquiryTarget, siteUrl?: string): string {
  const identity = [target.brand, target.model || target.name].filter(Boolean).join(' ');
  const lines: string[] = [];
  lines.push(`Halo Berkat Mandiri Pendingin, saya ingin menanyakan harga untuk produk berikut.`);
  lines.push('');
  lines.push(`Produk: ${identity || target.name}`);
  if (target.name && target.name !== identity) lines.push(`Nama di katalog: ${target.name}`);
  if (target.slug) {
    const base = siteUrl ?? (typeof window !== 'undefined' ? window.location.origin : 'https://www.berkatmandiripendingin.com');
    lines.push(`Referensi: ${base}/produk/${target.slug}`);
  }
  lines.push('');
  lines.push('Mohon info harga terbaik, ketersediaan stok, dan lead time-nya. Terima kasih.');
  return lines.join('\n');
}

/** URL wa.me siap klik untuk permintaan harga sebuah produk. */
export function buildPriceInquiryUrl(target: PriceInquiryTarget, siteUrl?: string): string {
  return `https://wa.me/${BMP_WA_NUMBER}?text=${encodeURIComponent(buildPriceInquiryMessage(target, siteUrl))}`;
}
