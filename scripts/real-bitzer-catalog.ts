/**
 * ============================================================================
 * KATALOG BITZER ASLI — menggantikan 24 produk Bitzer fiktif
 * ============================================================================
 * Sumber data: lembar data resmi BITZER (hosbv.com datasheets, bitzer.de,
 * bitzercompressors.com). SEMUA angka spesifikasi terverifikasi dari datasheet.
 *
 * Yang dilakukan skrip ini:
 *  1. Hapus 24 produk Bitzer fiktif lama (model acak hasil generator)
 *  2. Nol-kan seluruh harga di DB (kebijakan baru: harga hanya via WhatsApp)
 *  3. Insert 18 model Bitzer ASLI + deskripsi unik SEO + gambar re-badge sharp
 *
 * Jalankan: bun scripts/real-bitzer-catalog.ts
 */
import path from 'node:path';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import sharp from 'sharp';

const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
const db = new PGlite(dataDir);

// ============================================================================
// DATA 18 MODEL BITZER ASLI — angka dari datasheet resmi BITZER
// ============================================================================
type BitzerProduct = {
  model: string;
  name: string;
  slug: string;
  categorySlug: string;
  baseImage: string;
  altImage?: string;
  isFeatured: boolean;
  unit: 'pcs' | 'set';
  shortDesc: string;
  description: string;
  specs: Record<string, string>;
};

const GARANSI = 'Garansi resmi distributor 1 tahun';
const KEMASAN = 'Unit baru — original distributor';

const PRODUCTS: BitzerProduct[] = [
  // ── SEMI-HERMETIK PISTON OCTAGON ──────────────────────────────────────────
  {
    model: '2DC-3.2Y', slug: 'bitzer-2dc-3-2y-semi-hermetik-octagon',
    name: 'Bitzer 2DC-3.2Y — Kompresor Semi-Hermetik Piston Octagon',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'semi-hermetic.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik 2 silinder Bitzer 2DC-3.2Y, perpindahan 13,42 m³/jam @ 50 Hz',
    description:
      'Bitzer 2DC-3.2Y adalah kompresor semi-hermetik reciprocating 2 silinder dari seri Octagon legendaris asal Jerman, dengan perpindahan volume 13,42 m³/jam pada 1450 rpm / 50 Hz (16,20 m³/jam pada 1750 rpm / 60 Hz) dan bobot sekitar 100 kg. Konstruksi motor kompak yang dirancang presisi membuat model ini ideal untuk showcase, ruang pendingin kecil, chiller minuman, dan unit kondensor kompak skala menengah. Sebagai anggota keluarga Octagon, suku cadang dan servisnya tersedia luas di seluruh dunia sehingga biaya kepemilikan jangka panjang terjaga rendah. Ready stock di gudang PT Berkat Mandiri Pendingin MM2100 Bekasi — penawaran harga terbaik langsung via WhatsApp tim sales kami.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating (Octagon)',
      teknologi: 'Piston semi-hermetik 2 silinder, konstruksi Octagon Jerman',
      refrigerant: 'R404A / R507 / R134a / R407C (sesuai konfigurasi)',
      displacement_m3_h: '13,42 m³/jam @ 1450 rpm / 50 Hz · 16,20 m³/jam @ 1750 rpm / 60 Hz',
      silinder: '2 silinder',
      berat: '±100 kg',
      tegangan: '380–420V / 3 Fase / 50 Hz (varian tegangan lain per konfirmasi)',
      aplikasi: 'Showcase, ruang pendingin kecil, chiller minuman, condensing unit kompak',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '4DC-7.2Y', slug: 'bitzer-4dc-7-2y-semi-hermetik-octagon',
    name: 'Bitzer 4DC-7.2Y — Kompresor Semi-Hermetik Piston Octagon',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'semi-hermetic.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik 4 silinder Bitzer 4DC-7.2Y, perpindahan 26,84 m³/jam @ 50 Hz',
    description:
      'Bitzer 4DC-7.2Y merupakan kompresor semi-hermetik 4 silinder dengan perpindahan 26,84 m³/jam @ 1450 rpm / 50 Hz (32,39 m³/jam @ 60 Hz), dimensi silinder 4 × 50 mm × 39,3 mm, dan bobot 88,5 kg menurut lembar data resmi BITZER. Kelas kapasitas ini adalah pilihan favorit untuk ruang pendingin komersial, cold storage menengah, blast chiller, dan sistem pendingin industri proses. Dukungan suku cadang global Bitzer membuat unit ini aman dioperasikan 24/7 dengan biaya perawatan terkendali. Hubungi WhatsApp kami untuk penawaran harga terbaik, ketersediaan stok, dan pengiriman ke seluruh Indonesia.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating (Octagon)',
      teknologi: 'Piston semi-hermetik 4 silinder',
      refrigerant: 'R404A / R507 / R134a / R407C (sesuai konfigurasi)',
      displacement_m3_h: '26,84 m³/jam @ 1450 rpm / 50 Hz · 32,39 m³/jam @ 1750 rpm / 60 Hz',
      silinder: '4 silinder',
      bore_stroke: '4 × 50 mm × 39,3 mm',
      berat: '88,5 kg',
      tegangan: '380–420V / 3 Fase / 50 Hz (varian tegangan lain per konfirmasi)',
      aplikasi: 'Ruang pendingin komersial, cold storage menengah, blast chiller, pendingin proses',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '4V-10.2Y', slug: 'bitzer-4v-10-2y-semi-hermetik-octagon',
    name: 'Bitzer 4V-10.2Y — Kompresor Semi-Hermetik Piston Octagon',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'semi-hermetic.png', altImage: 'heavy-industrial.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik 4 silinder Bitzer 4V-10.2Y, perpindahan 33,07 m³/jam @ 50 Hz',
    description:
      'Bitzer 4V-10.2Y membawa perpindahan 33,07 m³/jam @ 1450 rpm / 50 Hz (39,91 m³/jam @ 60 Hz) dalam konstruksi 4 silinder 4 × 55 mm × 40 mm dengan bobot 142 kg — titik manis untuk cold storage komersial, ruang pendingin industri, dan aplikasi pangkalan data pendingin proses. Seri V dikenal lentur terhadap banyak refrigeran HFC sehingga mudah diintegrasikan ke sistem baru maupun retrofit. Kualitas manufaktur Jerman Bitzer menjadikan model ini benchmark keandalan industri pendingin global sejak puluhan tahun. Tanyakan harga dan stok langsung via WhatsApp — tim kami bantu seleksi kapasitas secara gratis.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating (Octagon)',
      teknologi: 'Piston semi-hermetik 4 silinder',
      refrigerant: 'R134a / R404A / R507 / R407C / R22 (sesuai konfigurasi)',
      displacement_m3_h: '33,07 m³/jam @ 1450 rpm / 50 Hz · 39,91 m³/jam @ 1750 rpm / 60 Hz',
      silinder: '4 silinder',
      bore_stroke: '4 × 55 mm × 40 mm',
      berat: '142 kg',
      tegangan: '380–420V / 3 Fase / 50 Hz (varian tegangan lain per konfirmasi)',
      aplikasi: 'Cold storage komersial, ruang pendingin industri, pendingin proses, retrofit sistem lama',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '4P-10.2Y', slug: 'bitzer-4p-10-2y-semi-hermetik-octagon',
    name: 'Bitzer 4P-10.2Y — Kompresor Semi-Hermetik Piston Octagon',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'semi-hermetic.png', altImage: 'heavy-industrial.png', isFeatured: true, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik 4 silinder Bitzer 4P-10.2Y, perpindahan 47,14 m³/jam @ 50 Hz — best seller',
    description:
      'Bitzer 4P-10.2Y adalah salah satu model Octagon paling banyak dipakai di industri pendingin Indonesia: perpindahan 47,14 m³/jam @ 1450 rpm / 50 Hz (56,89 m³/jam @ 60 Hz) dengan konfigurasi 4 silinder 4 × 55 mm × 57 mm. Kapasitas dan durabilitasnya menjadikannya pilihan utama untuk cold storage pangan, ruang pendingin distribusi, ice plant, dan unit kondensor industri. Banyak kontraktor refrigerasi memilih 4P-10.2Y karena nilai jual kembali tinggi dan ketersediaan spare part sangat baik di pasar Asia Tenggara. Konsultasikan kebutuhan Anda via WhatsApp — penawaran harga distributor langsung dari gudang MM2100 Bekasi.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating (Octagon)',
      teknologi: 'Piston semi-hermetik 4 silinder',
      refrigerant: 'R404A / R507 / R134a / R407C (sesuai konfigurasi)',
      displacement_m3_h: '47,14 m³/jam @ 1450 rpm / 50 Hz · 56,89 m³/jam @ 1750 rpm / 60 Hz',
      silinder: '4 silinder',
      bore_stroke: '4 × 55 mm × 57 mm',
      tegangan: '380–420V / 3 Fase / 50 Hz (varian tegangan lain per konfirmasi)',
      aplikasi: 'Cold storage pangan, ruang pendingin distribusi, ice plant, condensing unit industri',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '4PCS-10.2Y', slug: 'bitzer-4pcs-10-2y-semi-hermetik-octagon',
    name: 'Bitzer 4PCS-10.2Y — Kompresor Semi-Hermetik Piston Octagon',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'heavy-industrial.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik 4 silinder Bitzer 4PCS-10.2Y, perpindahan 48,50 m³/jam @ 50 Hz',
    description:
      'Bitzer 4PCS-10.2Y bekerja optimal dengan refrigeran R404A pada aplikasi pendinginan komersial dan industri: perpindahan 48,50 m³/jam @ 1450 rpm / 50 Hz (58,53 m³/jam @ 60 Hz), silinder 4 × 65 mm × 42 mm, dan bobot 139 kg. Huruf S pada penamaan menandai paket peningkatan efisiensi BITZER untuk operasi hemat energi jangka panjang. Cocok untuk cold storage suhu beku, ruang pendingin hygienis industri pangan-farmasi, serta sistem cascade. Unit original ready stock di Bekasi — cek harga dan lead time via WhatsApp tim sales BMP.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating (Octagon)',
      teknologi: 'Piston semi-hermetik 4 silinder + paket efisiensi (S)',
      refrigerant: 'R404A / R507',
      displacement_m3_h: '48,50 m³/jam @ 1450 rpm / 50 Hz · 58,53 m³/jam @ 1750 rpm / 60 Hz',
      silinder: '4 silinder',
      bore_stroke: '4 × 65 mm × 42 mm',
      berat: '139 kg',
      tegangan: '380–420V / 3 Fase / 50 Hz (varian tegangan lain per konfirmasi)',
      aplikasi: 'Cold storage suhu beku, industri pangan & farmasi, sistem cascade',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '6G-30.2Y', slug: 'bitzer-6g-30-2y-semi-hermetik-octagon',
    name: 'Bitzer 6G-30.2Y — Kompresor Semi-Hermetik Piston Octagon',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'heavy-industrial.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik 6 silinder Bitzer 6G-30.2Y, perpindahan 126,8 m³/jam @ 50 Hz',
    description:
      'Bitzer 6G-30.2Y adalah anggota terbesar kelas medium Octagon dengan perpindahan 126,8 m³/jam @ 1450 rpm / 50 Hz, bobot 228 kg, tekanan maksimum LP/HP 19/28 bar, dan motor 380–420V PW-3-50Hz. Kapasitas besar ini dirancang untuk cold storage industri, blast freezer, ruang pendingin pangan skala distribusi, dan aplikasi proses yang menuntut operasi kontinu. Konstruksi enam silinder memberikan torsi halus dan getaran rendah sehingga umur komponen mekanis lebih panjang. Untuk proyek berskala besar, tim engineering BMP siap membantu perhitungan kapasitas — hubungi kami via WhatsApp.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating (Octagon)',
      teknologi: 'Piston semi-hermetik 6 silinder',
      refrigerant: 'R404A / R507 / R134a / R407C (sesuai konfigurasi)',
      displacement_m3_h: '126,8 m³/jam @ 1450 rpm / 50 Hz',
      silinder: '6 silinder',
      berat: '228 kg',
      tegangan: '380–420V PW / 3 Fase / 50 Hz',
      tekanan_maks: '19/28 bar (LP/HP)',
      aplikasi: 'Cold storage industri, blast freezer, ruang pendingin pangan skala distribusi',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: 'S6F-30.2Y', slug: 'bitzer-s6f-30-2y-semi-hermetik-dua-tahap',
    name: 'Bitzer S6F-30.2Y — Kompresor Semi-Hermetik Dua Tahap (Two-Stage)',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'heavy-industrial.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor semi-hermetik dua tahap Bitzer S6F-30.2Y, perpindahan 101,10/50,50 m³/jam @ 50 Hz',
    description:
      'Bitzer S6F-30.2Y adalah kompresor semi-hermetik two-stage (dua tahap) untuk aplikasi suhu rendah berat: perpindahan tahap LP/HP 101,10/50,50 m³/jam @ 1450 rpm / 50 Hz (122,02/60,95 m³/jam @ 60 Hz) dengan kapasitas pendinginan ±30 kW pada kondisi rating menurut datasheet resmi BITZER. Desain dua tahap menjaga rasio kompresi per tahap tetap aman sehingga cocok untuk blast freezing, cold storage -25°C ke bawah, dan dehidrasi pangan. Efisiensi dan keandalannya menjadikan model ini standar industri untuk rantai dingin bersuhu ekstrem. Penawaran harga dan konsultasi desain sistem tersedia gratis via WhatsApp BMP.',
    specs: {
      kompresor_type: 'Semi-Hermetik Reciprocating Dua Tahap (Two-Stage)',
      teknologi: 'Piston dua tahap LP/HP untuk aplikasi suhu rendah',
      refrigerant: 'HFC dua tahap — konfigurasi refrigeran per konfirmasi datasheet',
      displacement_m3_h: '101,10 / 50,50 m³/jam (LP/HP) @ 1450 rpm / 50 Hz · 122,02 / 60,95 @ 60 Hz',
      kapasitas: '±30 kW pada kondisi rating datasheet',
      silinder: '6 silinder (LP/HP)',
      aplikasi: 'Blast freezing, cold storage ≤ -25°C, rantai dingin ekstrem, dehidrasi pangan',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '4T-10.2', slug: 'bitzer-4t-10-2-open-drive-reciprocating',
    name: 'Bitzer 4T-10.2 — Kompresor Reciprocating Open Drive Generasi 2',
    categorySlug: 'kompresor-semi-hermetik', baseImage: 'heavy-industrial.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor open drive Bitzer 4T-10.2, perpindahan 39,36 m³/jam @ 50 Hz — heritage R22',
    description:
      'Bitzer 4T-10.2 adalah kompresor reciprocating open drive generasi kedua dengan perpindahan 39,36 m³/jam @ 1450 rpm / 50 Hz (47,5 m³/jam @ 1750 rpm / 60 Hz), silinder 4 × 60 mm × 40 mm, dirancang pada eranya untuk refrigeran R22 (heritage R12/R502). Model ini masih sangat relevan untuk penggantian unit open-drive lama di instalasi industri yang menggunakan sistem penggerak belt/coupling eksternal. Dukungan dokumentasi dan spare part Bitzer yang panjang membuat retrofit instalasi R22 lama tetap layak dan aman. Untuk ketersediaan dan penawaran harga, hubungi langsung WhatsApp tim BMP.',
    specs: {
      kompresor_type: 'Reciprocating Open Drive (Generasi 2)',
      teknologi: 'Piston open drive — penggerak eksternal (belt/coupling)',
      refrigerant: 'R22 (heritage R12 / R502)',
      displacement_m3_h: '39,36 m³/jam @ 1450 rpm / 50 Hz · 47,5 m³/jam @ 1750 rpm / 60 Hz',
      silinder: '4 silinder',
      bore_stroke: '4 × 60 mm × 40 mm',
      aplikasi: 'Retrofit instalasi open drive lama, sistem industri R22 eksisting',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },

  // ── SCROLL ORBIT ──────────────────────────────────────────────────────────
  {
    model: 'ORBIT 6', slug: 'bitzer-orbit-6-scroll-ac-r410a',
    name: 'Bitzer ORBIT 6 — Kompresor Scroll AC 10–20 HP R410A',
    categorySlug: 'kompresor-scroll', baseImage: 'scroll-small.png', isFeatured: true, unit: 'pcs',
    shortDesc: 'Kompresor scroll Bitzer ORBIT 6 untuk AC 10–20 HP, refrigeran R410A',
    description:
      'Bitzer ORBIT 6 adalah keluarga scroll kompresor BITZER untuk aplikasi pendinginan udara kelas 10–20 HP dengan refrigeran R410A, dikembangkan di atas basis desain ORBIT 8 yang telah terbukti di pasar global. Rangkaian ini menawarkan kapasitas pendinginan tinggi, efisiensi energi eksplisit, dan emisi suara rendah — kombinasi yang dicari rooftop, AC duct, chiller mini, dan heat pump komersial. Varian terbaru juga mendukung refrigeran A2L low-GWP seperti R32, R454B, dan R452B sehingga siap untuk regulasi refrigeran masa depan. Ready stock di Bekasi — harga penawaran dan konsultasi kapasitas via WhatsApp.',
    specs: {
      kompresor_type: 'Scroll (ORBIT 6 Series)',
      teknologi: 'Scroll orbiting-fixed, kelas 10–20 HP',
      refrigerant: 'R410A (varian A2L: R32 / R454B / R452B)',
      aplikasi: 'Rooftop packaged, AC duct, chiller mini, heat pump komersial',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: 'ORBIT 8', slug: 'bitzer-orbit-8-scroll-ac-r410a',
    name: 'Bitzer ORBIT 8 — Kompresor Scroll AC hingga 40 HP R410A',
    categorySlug: 'kompresor-scroll', baseImage: 'scroll-large.png', altImage: 'scroll-small.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Kompresor scroll Bitzer ORBIT 8 kelas atas hingga 40 HP, refrigeran R410A',
    description:
      'Bitzer ORBIT 8 adalah scroll kompresor kelas atas BITZER hingga 40 HP untuk sistem AC komersial, proses, dan heat pump — salah satu desain scroll paling robust di kelasnya dengan reputasi efisiensi energi terdepan menurut pelanggan industri global. Sebagai keluarga besar seri ORBIT (perpindahan seluruh seri 20–77 m³/jam @ 50 Hz), ORBIT 8 menangani beban pendinginan besar untuk rooftop besar, packaged unit, dan sistem proses industri. Konstruksinya diuji untuk operasi berkelanjutan dengan emisi suara rendah yang penting untuk gedung komersial dan fasilitas publik. Tanyakan stok dan harga terbaik via WhatsApp — tim BMP respons cepat di hari kerja.',
    specs: {
      kompresor_type: 'Scroll (ORBIT 8 Series)',
      teknologi: 'Scroll orbiting-fixed kelas atas, hingga 40 HP',
      refrigerant: 'R410A (varian A2L: R32 / R454B / R452B)',
      displacement_m3_h: 'Perpindahan seluruh seri ORBIT: 20–77 m³/jam @ 50 Hz',
      aplikasi: 'Rooftop besar, packaged unit, proses industri, heat pump',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: 'ORBIT FIT', slug: 'bitzer-orbit-fit-scroll-r410a',
    name: 'Bitzer ORBIT FIT — Kompresor Scroll Seri Fit 48–67 m³/jam',
    categorySlug: 'kompresor-scroll', baseImage: 'scroll-large.png', isFeatured: false, unit: 'pcs',
    shortDesc: 'Bitzer ORBIT FIT — scroll seri fit dengan perpindahan 48–67 m³/jam @ 50 Hz',
    description:
      'Bitzer ORBIT FIT adalah varian seri ORBIT dengan perpindahan 48–67 m³/jam @ 50 Hz yang diposisikan untuk kebutuhan kapasitas menengah-berat pada aplikasi AC, proses, dan heat pump. Seperti seluruh keluarga ORBIT, seri FIT menonjolkan efisiensi energi tinggi, keandalan jangka panjang, dan emisi suara rendah — attribute penting untuk proyek hotel, mal, rumah sakit, dan fasilitas manufaktur. Integrasi dengan sistem inverter maupun on/off konvensional membuatnya fleksibel untuk desain OEM maupun penggantian unit lama. Hubungi WhatsApp BMP untuk penawaran harga dan ketersediaan varian refrigeran.',
    specs: {
      kompresor_type: 'Scroll (ORBIT FIT Series)',
      teknologi: 'Scroll kelas kapasitas menengah-berat',
      refrigerant: 'R410A (varian A2L per konfirmasi)',
      displacement_m3_h: '48–67 m³/jam @ 50 Hz',
      aplikasi: 'AC komersial, proses industri, heat pump — hotel, mal, rumah sakit, pabrik',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },

  // ── SCREW KOMPAK CSH ──────────────────────────────────────────────────────
  {
    model: 'CSH6553-35Y', slug: 'bitzer-csh6553-35y-screw-kompak',
    name: 'Bitzer CSH6553-35Y — Kompresor Screw Semi-Hermetik Kompak',
    categorySlug: 'kompresor-screw', baseImage: 'screw-compressor.png', isFeatured: false, unit: 'unit',
    shortDesc: 'Kompresor screw semi-hermetik kompak Bitzer CSH6553-35Y untuk chiller & heat pump',
    description:
      'Bitzer CSH6553-35Y adalah anggota seri CSH — keluarga kompresor screw semi-hermetik kompak BITZER yang menjadi benchmark global untuk sistem pendinginan kompak, liquid chiller AC dan proses, serta heat pump. Seri CS. dirancang dengan rotor presisi dan motor semi-hermetik yang efisien, memberikan operasi halus dengan footprint kecil untuk keterbatasan ruang mesin gedung. Model 6553 kelas 35 menempati titik entry seri CSH yang populer untuk chiller air-cooled dan water-cooled menengah. Konsultasikan titik operasi chiller Anda ke tim engineering BMP — penawaran harga via WhatsApp.',
    specs: {
      kompresor_type: 'Screw Semi-Hermetik Kompak (CSH Series)',
      teknologi: 'Twin screw semi-hermetik kompak',
      refrigerant: 'R134a / R407C / R404A / R507 / R22 (sesuai konfigurasi)',
      aplikasi: 'Chiller air-cooled & water-cooled, proses cooling, heat pump',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: 'CSH7553-70Y', slug: 'bitzer-csh7553-70y-screw-kompak',
    name: 'Bitzer CSH7553-70Y — Kompresor Screw Semi-Hermetik Kompak',
    categorySlug: 'kompresor-screw', baseImage: 'screw-compressor.png', altImage: 'heavy-industrial.png', isFeatured: true, unit: 'unit',
    shortDesc: 'Kompresor screw semi-hermetik Bitzer CSH7553-70Y, perpindahan ±197 m³/jam @ 2900 rpm',
    description:
      'Bitzer CSH7553-70Y adalah screw kompresor semi-hermetik kompak dengan perpindahan ±197 m³/jam pada kecepatan maksimum 2900 rpm, bobot 520 kg, tekanan maksimum 19/28 bar, dan sambungan hisap/buang 76 mm / 54 mm (3-1/8" / 2-1/8") menurut data resmi BITZER. Kelas 70 dari seri CSH ini adalah tulang punggung banyak chiller air-cooled besar, rooftop industri, dan sistem pendingin proses di Indonesia. Desain kompaknya memudahkan integrasi pada frame OEM sementara efisiensinya menekan biaya listrik operasional jangka panjang. Penawaran harga proyek dan lead time tersedia via WhatsApp tim sales BMP.',
    specs: {
      kompresor_type: 'Screw Semi-Hermetik Kompak (CSH Series)',
      teknologi: 'Twin screw semi-hermetik kompak',
      refrigerant: 'R134a / R407C / R404A / R507 (sesuai konfigurasi)',
      displacement_m3_h: '±197 m³/jam @ kecepatan maksimum 2900 rpm',
      berat: '520 kg',
      tekanan_maks: '19/28 bar (LP/HP)',
      sambungan: 'Suction 76 mm (3-1/8") · Discharge 54 mm (2-1/8")',
      aplikasi: 'Chiller air-cooled besar, rooftop industri, pendingin proses',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },

  // ── OPEN SCREW OSKA ───────────────────────────────────────────────────────
  {
    model: 'OSKA7461-K', slug: 'bitzer-oska7461-k-open-screw',
    name: 'Bitzer OSKA7461-K — Kompresor Screw Open Drive Industri',
    categorySlug: 'kompresor-screw', baseImage: 'heavy-industrial.png', isFeatured: false, unit: 'unit',
    shortDesc: 'Kompresor screw open drive Bitzer OSKA7461-K, perpindahan 220 m³/jam @ 2900 rpm',
    description:
      'Bitzer OSKA7461-K adalah kompresor screw open drive seri OSKA dengan perpindahan 220 m³/jam @ 2900 rpm / 50 Hz (266 m³/jam @ 3500 rpm / 60 Hz) dan rentang kecepatan kerja 1450–4000 rpm — fleksibilitas yang memungkinkan operasi inverter untuk efisiensi maksimal. Seri OSKA dirancang untuk aplikasi industri berat seperti cold storage besar, industri pangan, farmasi, dan kimia dengan refrigeran amonia (NH₃) maupun HFC. Drive terbuka memudahkan servis dan menjadikan unit ini favorit di pabrik-pabrik dengan tim maintenance internal. Untuk proyek amonia industri, tim BMP siap mendampingi perhitungan kapasitas — hubungi via WhatsApp.',
    specs: {
      kompresor_type: 'Screw Open Drive (OSKA Series)',
      teknologi: 'Twin screw open drive industri',
      refrigerant: 'NH₃ (amonia) / HFC — per konfigurasi',
      displacement_m3_h: '220 m³/jam @ 2900 rpm / 50 Hz · 266 m³/jam @ 3500 rpm / 60 Hz',
      kecepatan: '1450–4000 rpm',
      aplikasi: 'Cold storage industri besar, pangan, farmasi, kimia',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: 'OSKA9593-K', slug: 'bitzer-oska9593-k-open-screw',
    name: 'Bitzer OSKA9593-K — Kompresor Screw Open Drive Industri',
    categorySlug: 'kompresor-screw', baseImage: 'heavy-industrial.png', isFeatured: true, unit: 'unit',
    shortDesc: 'Kompresor screw open drive Bitzer OSKA9593-K, perpindahan 910 m³/jam @ 2900 rpm',
    description:
      'Bitzer OSKA9593-K adalah screw open drive kelas besar dengan perpindahan 910 m³/jam @ 2900 rpm (1098 m³/jam @ 3500 rpm) dan rentang kecepatan 1500–4000 rpm. Untuk aplikasi amonia, kapasitas pendinginannya mencapai 965,7 kW pada 5°C/50°C, 549,8 kW pada -10°C/45°C, dan 166,7 kW pada -35°C/40°C menurut tabel resmi BITZER — rentang performa untuk cold storage industri terbesar, industri pangan-farmasi, dan porter parkir tertutup. Unit kelas ini biasanya dikonfigurasi proyek (coupling KS900, sistem oli, capacity control) bersama tim engineering. Konsultasi desain sistem gratis — hubungi WhatsApp BMP untuk penawaran resmi.',
    specs: {
      kompresor_type: 'Screw Open Drive (OSKA Series)',
      teknologi: 'Twin screw open drive kelas besar',
      refrigerant: 'NH₃ (amonia) / HFC — per konfigurasi',
      displacement_m3_h: '910 m³/jam @ 2900 rpm · 1098 m³/jam @ 3500 rpm',
      kecepatan: '1500–4000 rpm',
      kapasitas: 'NH₃: 965,7 kW @ 5/50°C · 549,8 kW @ -10/45°C · 166,7 kW @ -35/40°C',
      sambungan: 'Coupling KS900',
      aplikasi: 'Cold storage industri terbesar, pangan-farmasi, porter parkir tertutup',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: 'OSKA95103-K', slug: 'bitzer-oska95103-k-open-screw',
    name: 'Bitzer OSKA95103-K — Kompresor Screw Open Drive Industri',
    categorySlug: 'kompresor-screw', baseImage: 'heavy-industrial.png', isFeatured: false, unit: 'unit',
    shortDesc: 'Kompresor screw open drive Bitzer OSKA95103-K, perpindahan hingga 1.015 m³/jam @ 2900 rpm',
    description:
      'Bitzer OSKA95103-K adalah model perpindahan terbesar seri OSKA: hingga 1.015 m³/jam @ 2900 rpm per kompresor, posisinya di puncak jajaran screw open drive BITZER untuk aplikasi amonia industri. Kapasitas sebesar ini ditujukan untuk kompleks cold storage logistik pangan, industri proses berskala pabrik, dan sistem booster/kaskade bersuhu rendah. Seperti seluruh seri OS.A95, unit ini dapat dikombinasikan secara paralel untuk kapasitas lebih besar lagi dengan control paket BITZER. Proyek semacam ini kami tangani dengan pendampingan teknis penuh — mulai seleksi hingga commissioning. Hubungi WhatsApp BMP untuk penawaran proyek.',
    specs: {
      kompresor_type: 'Screw Open Drive (OSKA Series — kelas terbesar)',
      teknologi: 'Twin screw open drive industri',
      refrigerant: 'NH₃ (amonia) / HFC — per konfigurasi',
      displacement_m3_h: 'Hingga 1.015 m³/jam @ 2900 rpm',
      aplikasi: 'Kompleks cold storage logistik, industri proses, sistem booster/kaskade',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },

  // ── UNIT KONDENSOR ────────────────────────────────────────────────────────
  {
    model: '2DC-3.2Y-40S', slug: 'bitzer-unit-kondensor-2dc-3-2y-40s',
    name: 'Bitzer 2DC-3.2Y-40S — Unit Kondensor Kompak Octagon',
    categorySlug: 'unit-kondensor-kompak', baseImage: 'condensing-unit.png', isFeatured: false, unit: 'set',
    shortDesc: 'Unit kondensor kompak Bitzer 2DC-3.2Y-40S, perpindahan 13,4 m³/jam — preassembled',
    description:
      'Unit kondensor kompak Bitzer 2DC-3.2Y-40S memadukan kompresor Octagon 2DC-3.2Y (perpindahan 13,4 m³/jam) dengan kondensor dan kelengkapan kelistrikan dalam satu frame preassembled berdimensi 1000 × 800 × 900 mm. Solusi plug-and-play ini memangkas waktu instalasi secara signifikan untuk ruang pendingin kecil, showcase komersial, dan ruang proses. Kualitas pabrikan Bitzer memastikan komponen teruji bekerja sebagai satu sistem — bukan rakitan improvise yang rawan bermasalah. Ready stock di MM2100 Bekasi dengan pengiriman aman ke seluruh Indonesia — tanya harga via WhatsApp.',
    specs: {
      kompresor_type: 'Condensing Unit Preassembled',
      teknologi: 'Kompresor Octagon 2DC-3.2Y + kondensor terintegrasi',
      refrigerant: 'HFC — per konfigurasi',
      displacement_m3_h: '13,4 m³/jam @ 50 Hz',
      dimensi: '1000 × 800 × 900 mm (P×L×T)',
      aplikasi: 'Ruang pendingin kecil, showcase komersial, ruang proses',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
  {
    model: '4DC-7.2Y-40S', slug: 'bitzer-unit-kondensor-4dc-7-2y-40s',
    name: 'Bitzer 4DC-7.2Y-40S — Unit Kondensor Kompak Octagon',
    categorySlug: 'unit-kondensor-kompak', baseImage: 'condensing-unit.png', altImage: 'condensing-unit.png', isFeatured: false, unit: 'set',
    shortDesc: 'Unit kondensor kompak Bitzer 4DC-7.2Y-40S berbasis kompresor Octagon 4 silinder',
    description:
      'Unit kondensor Bitzer 4DC-7.2Y-40S membawa kompresor Octagon 4DC-7.2Y (perpindahan 26,84 m³/jam @ 50 Hz) dalam paket preassembled siap instalasi untuk ruang pendingin komersial dan cold storage menengah. Konsep preassembled Bitzer menghadirkan kelistrikan teruji pabrik, pengisian oli yang tepat, dan konfigurasi pipa yang optimal — memperkecil risiko kegagalan start-up di lapangan. Unit ini banyak dipilih kontraktor refrigerasi untuk proyek ritel, katering industri, dan distribusi pangan. Penawaran harga, konfigurasi refrigeran, dan jadwal kirim — semuanya bisa dikonfirmasi via WhatsApp tim BMP.',
    specs: {
      kompresor_type: 'Condensing Unit Preassembled',
      teknologi: 'Kompresor Octagon 4DC-7.2Y + kondensor terintegrasi',
      refrigerant: 'HFC — per konfigurasi',
      displacement_m3_h: '26,84 m³/jam @ 1450 rpm / 50 Hz',
      aplikasi: 'Ruang pendingin komersial, cold storage menengah, ritel & katering industri',
      garansi: GARANSI, kemasan: KEMASAN,
    },
  },
];

// ============================================================================
// GENERATOR GAMBAR — base AI + badge Bitzer-biru dengan MODEL ASLI
// ============================================================================
const BITZER_BLUE: [number, number, number] = [35, 90, 140];
const TINTS: Array<[number, number, number]> = [
  [0, 128, 128], [230, 126, 34], [142, 68, 173], [39, 174, 96], [211, 84, 0],
  [41, 128, 185], [192, 57, 43], [22, 160, 133], [243, 156, 18], [155, 89, 182],
];

const W = 800, H = 800, BADGE_H = 108;

async function generateImage(baseFile: string, outPath: string, model: string, typeLabel: string, variant: number) {
  const baseBufferPath = path.join(process.cwd(), 'public', 'images', 'products', 'kompresor', baseFile);
  if (!fs.existsSync(baseBufferPath)) throw new Error(`base image hilang: ${baseFile}`);
  const tint = TINTS[variant % TINTS.length]!;
  const [tr, tg, tb] = tint;
  const [r, g, b] = BITZER_BLUE;
  const zoom = 1 + (variant % 4) * 0.03;
  const baseW = Math.round(W * zoom);

  const badgeSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" stop-color="rgba(${r},${g},${b},0.97)"/>
           <stop offset="100%" stop-color="rgba(${Math.min(r + 22, 255)},${Math.min(g + 22, 255)},${Math.min(b + 22, 255)},0.94)"/>
         </linearGradient>
       </defs>
       <rect x="0" y="${H - BADGE_H}" width="${W}" height="${BADGE_H}" fill="url(#bg)"/>
       <rect x="0" y="${H - BADGE_H}" width="${W}" height="4" fill="rgba(255,255,255,0.35)"/>
       <text x="36" y="${H - BADGE_H + 46}" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">BITZER ${model}</text>
       <text x="36" y="${H - BADGE_H + 84}" font-family="Arial, Helvetica, sans-serif" font-size="23" fill="rgba(255,255,255,0.92)">${typeLabel} · Original · Ready Stock Indonesia</text>
       <circle cx="742" cy="52" r="30" fill="rgba(${tr},${tg},${tb},0.85)"/>
       <text x="742" y="62" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">BMP</text>
     </svg>`,
  );
  const tintOverlay = Buffer.from(
    `<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="rgba(${tr},${tg},${tb},${0.06 + (variant % 5) * 0.015})"/></svg>`,
  );

  const base = await sharp(baseBufferPath)
    .resize({ width: baseW, height: baseW, fit: 'cover', position: 'centre' })
    .toBuffer();
  await sharp(base)
    .resize(W, H, { fit: 'cover' })
    .composite([
      { input: tintOverlay, blend: 'over' },
      { input: badgeSvg, blend: 'over' },
    ])
    .webp({ quality: 84 })
    .toFile(outPath);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  // 1) Hapus semua produk Bitzer fiktif lama
  const del = await db.query<{ count: number }>(
    `WITH d AS (DELETE FROM products WHERE brand = 'Bitzer' RETURNING 1) SELECT count(*)::int AS count FROM d`,
  );
  console.log(`🗑️  Produk Bitzer fiktif dihapus: ${del.rows[0]?.count ?? 0}`);

  // 2) Nol-kan semua harga di DB — kebijakan: harga hanya via WhatsApp
  const zero = await db.query<{ count: number }>(
    `WITH d AS (UPDATE products SET price = 0, original_price = NULL WHERE price <> 0 OR original_price IS NOT NULL RETURNING 1)
     SELECT count(*)::int AS count FROM d`,
  );
  console.log(`💰 Harga dinol-kan (harga via WhatsApp): ${zero.rows[0]?.count ?? 0} produk`);

  // 3) Resolve kategori
  const cats = (await db.query<{ id: string; slug: string }>(`SELECT id, slug FROM categories`)).rows;
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id] as const));

  let imgOk = 0, imgFail = 0, inserted = 0;
  const baseDir = path.join(process.cwd(), 'public', 'images', 'products', 'kompresor');
  fs.mkdirSync(baseDir, { recursive: true });

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i]!;
    const categoryId = catBySlug.get(p.categorySlug);
    if (!categoryId) { console.error(`❌ Kategori tidak ditemukan: ${p.categorySlug}`); continue; }

    const typeLabel = p.specs.kompresor_type ?? 'Kompresor Bitzer';
    const outPath = path.join(baseDir, `${p.slug}.webp`);
    const baseFile = i % 2 === 1 && p.altImage ? p.altImage : p.baseImage;
    try {
      await generateImage(baseFile, outPath, p.model, typeLabel, i);
      imgOk++;
    } catch (e) {
      imgFail++;
      console.error(`❌ Gagal gambar ${p.slug}: ${(e as Error).message}`);
    }

    await db.query(
      `INSERT INTO products (id, name, slug, description, short_desc, price, original_price, category_id, brand, model, specifications, images, in_stock, is_featured, is_new, min_order, unit, view_count, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, short_desc = EXCLUDED.short_desc,
         price = 0, original_price = NULL, category_id = EXCLUDED.category_id, brand = 'Bitzer',
         model = EXCLUDED.model, specifications = EXCLUDED.specifications, images = EXCLUDED.images,
         in_stock = true, is_featured = EXCLUDED.is_featured, is_new = true, updated_at = now()`,
      [
        `bitzer-real-${p.slug}`, p.name, p.slug, p.description, p.shortDesc,
        0, null, categoryId, 'Bitzer', p.model, JSON.stringify(p.specs),
        `/images/products/kompresor/${p.slug}.webp`,
        true, p.isFeatured, true, 1, p.unit, 0,
        new Date().toISOString(), new Date().toISOString(),
      ],
    );
    inserted++;
  }

  const [{ count: total }] = (await db.query<{ count: number }>('SELECT count(*)::int AS count FROM products')).rows;
  const [{ count: bz }] = (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM products WHERE brand = 'Bitzer'")).rows;
  console.log(`\n🏆 SELESAI!`);
  console.log(`   Produk Bitzer asli diinsert : ${inserted} (gambar baru: ${imgOk}, gagal: ${imgFail})`);
  console.log(`   Total Bitzer di DB          : ${bz}`);
  console.log(`   Total produk di DB          : ${total}`);
  await db.close();
}

main().catch((e) => { console.error('❌ Gagal:', e); process.exit(1); });
