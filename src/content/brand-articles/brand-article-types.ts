export type BrandArticleSeed = {
  /** Slug permanen, dipakai sebagai URL /insights/<slug> dan ID seed `brand-<slug>` */
  slug: string;
  /** Judul tampil di halaman (H1) */
  title: string;
  /** Ringkasan 1-2 kalimat untuk kartu blog */
  excerpt: string;
  /** Tag <title> SEO — tanpa nama situs (template layout menambahkannya) */
  seoTitle: string;
  /** Meta description 150-160 karakter */
  seoDescription: string;
  /** Gambar cover dari aset katalog internal */
  coverImage: string;
  authorName: string;
  /** ISO string zona Jakarta */
  publishedAt: string;
  /** Konten markdown lengkap dengan seksi FAQ (di-parsing jadi FAQPage JSON-LD) */
  content: string;
};
