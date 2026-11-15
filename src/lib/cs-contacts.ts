/**
 * Tim Customer Service BMP — sumber tunggal (single source of truth)
 * data kontak CS. Dipakai oleh ContactSection, Footer, InfoPages,
 * dan JSON-LD contactPoint (layout.tsx & page.tsx).
 *
 * Untuk mengubah/ menambah CS: edit hanya di sini.
 */

export type CsContact = {
  /** N lengkap dengan gelar */
  name: string;
  /** Peran yang ditampilkan di UI */
  role: string;
  /** Nomor WhatsApp format internasional tanpa '+' — untuk wa.me */
  waNumber: string;
  /** Nomor format tampilan manusiawi */
  waDisplay: string;
  /** Pesan pembuka chat yang terisi otomatis */
  waMessage: string;
};

export const CS_CONTACTS: CsContact[] = [
  {
    name: 'Acep Sihabudin',
    role: 'Customer Service',
    waNumber: '6281220030092',
    waDisplay: '+62 812-2003-0092',
    waMessage: 'Halo Pak Acep, saya ingin bertanya tentang produk Berkat Mandiri Pendingin.',
  },
  {
    name: 'H. Gugun Gunara, S.E., M.M',
    role: 'Customer Service',
    waNumber: '6281316516524',
    waDisplay: '+62 813-1651-6524',
    waMessage: 'Halo Pak Gugun, saya ingin bertanya tentang produk Berkat Mandiri Pendingin.',
  },
];

/** Bangun URL wa.me CS dengan pesan pembuka terformat. */
export function csWaUrl(contact: CsContact): string {
  return `https://wa.me/${contact.waNumber}?text=${encodeURIComponent(contact.waMessage)}`;
}
