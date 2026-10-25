<div align="center">

<img src="public/images/logo.svg" width="110" alt="Logo Berkat Mandiri Pendingin" />

# 🧊 BERKAT MANDIRI PENDINGIN

### *Katalog Kompresor & Sistem Pendingin Terbesar yang Pernah Dibangun dengan Next.js*

**620 produk · 25 brand dunia · 512 gambar unik · 623 URL terindeks · SEO Total menuju #1 Google** 🚀

![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5_strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PGlite-PostgreSQL_WASM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6_legacy_seed-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SEO Ready](https://img.shields.io/badge/SEO-JSON--LD_×5_+_623_URL-F59E0B?style=for-the-badge&logo=google&logoColor=white)

**Bahasa:** 🇮🇩 Indonesia · [🇬🇧 English](#-english-documentation)

</div>

---

## 📖 Daftar Isi

- [✨ Tentang Proyek Ini](#-tentang-proyek-ini)
- [📊 Angka yang Berbicara](#-angka-yang-berbicara)
- [🗺️ Peta Rute Website](#️-peta-rute-website)
- [🏗️ Arsitektur](#️-arsitektur)
- [🚀 Mulai Cepat (3 Perintah)](#-mulai-cepat-3-perintah)
- [📜 Semua Perintah (Terverifikasi)](#-semua-perintah-terverifikasi)
- [🖼️ Pabrik Gambar & Katalog — Bagaimana 500 Produk Lahir](#️-pabrik-gambar--katalog--bagaimana-500-produk-lahir)
- [💚 SEO Playbook — Senjata Menuju #1 Google](#-seo-playbook--senjata-menuju-1-google)
- [🎛️ Admin CMS — Kokpit Sang Administrator](#️-admin-cms--kokpit-sang-administrator)
- [🌐 Fitur Dwi-Bahasa (ID/EN)](#-fitur-dwi-bahasa-iden)
- [🛡️ Jaminan Totalitas Gambar](#️-jaminan-totalitas-gambar)
- [🌍 Deploy — Panduan Jujur Sesuai Arsitektur](#-deploy--panduan-jujur-sesuai-arsitektur)
- [📂 Struktur Proyek](#-struktur-proyek)
- [🆘 Troubleshooting](#-troubleshooting)
- [🏛️ Kredit & Penghargaan](#️-kredit--penghargaan)
- [📄 Lisensi](#-lisensi)

---

## ✨ Tentang Proyek Ini

Website resmi **PT Berkat Mandiri Pendingin** — distributor HVAC resmi sejak **2010** di Kawasan Industri MM2100, Bekasi. 

Ini bukan sekadar company profile. Ini adalah **mesin pemasaran digital lengkap**: katalog B2B raksasa berisi 620 produk lintas 25 brand dunia, ditopang database PostgreSQL tertanam, CMS admin penuh, dan persenjataan SEO terlengkap yang pernah dipasang di website distributor pendingin Indonesia — semuanya dirancang untuk **merajai halaman pencarian Google**.

| 💪 Kemampuan | Keterangan |
|---|---|
| 🛒 **Katalog 620 Produk** | 19 kategori — 558 di antaranya kompresor (rotary, twin-rotary, DC inverter, scroll, piston hermetik, semi-hermetik, screw, condensing unit) |
| 🏭 **25 Brand Dunia** | Bitzer, Copeland, Daikin, Panasonic, LG, Gree, Danfoss, Carrier, Hitachi, Mitsubishi, Sanyo, Toshiba, dan lainnya |
| 🖼️ **512 Gambar Produk Unik** | 12 foto studio hasil kecerdasan buatan + 500 derivatif berbadge brand via pemrosesan `sharp` — nol gambar generik, nol gambar rusak |
| 💚 **SEO Total 5 Lapis** | JSON-LD: Organization · LocalBusiness · WebSite · Product+Offer+FAQPage · BreadcrumbList |
| 🤖 **Siap AI Search** | `llms.txt` — website terbaca ChatGPT, Perplexity, dan Google AI Overviews |
| 🛍️ **Keranjang + Order WhatsApp** | Pesanan terformat rapi otomatis terkirim ke WhatsApp sales |
| 🎛️ **Admin CMS Penuh** | Kelola produk, artikel, SEO guide, backup database — dari browser |
| 📰 **Insight HVAC** | Blog/artikel ber-SEO dari CMS — amunisi konten untuk dominasi kata kunci |
| 🌏 **Dwi-Bahasa ID/EN** | 320+ kunci terjemahan, satu klik seluruh antarmuka berganti, preferensi tersimpan permanen |
| 📱 **Mobile-First Responsif** | Sempurna dari layar 320px sampai ultrawide — terverifikasi iPhone 14 & desktop |
| ⚡ **Harga Dinamis + Diskon** | Harga distributor Rupiah, badge hemat %, strikethrough harga normal |

---

## 📊 Angka yang Berbicara

| Metrik | Nilai | Cara Verifikasi Sendiri |
|---|---:|---|
| Produk di database | **620** | Halaman `/produk` — badge "620 varian terdaftar" |
| Kategori | **19** | 10 kategori utama + 9 sub-kategori kompresor |
| Gambar produk kompresor | **512** | `ls public/images/products/kompresor/ \| wc -l` |
| URL di sitemap | **623** | Buka `/sitemap.xml` |
| Brand tersedia | **25** | Filter brand di halaman katalog |
| Tipe structured data (JSON-LD) | **5** | View-source halaman detail produk |
| Skrip pipeline otomatis | **6** | Folder `scripts/` |
| Komponen UI kustom | **21+** | Folder `src/components/berkat/` |

---

## 🗺️ Peta Rute Website

| Rute | Fungsi | SEO |
|---|---|---|
| `/` | Homepage 13 section — hero, kategori, katalog, testimoni, galeri, kontak | JSON-LD Organization + LocalBusiness + WebSite |
| `/produk` | Katalog universal 620 varian — filter kategori, brand, pencarian instan | Metadata katalog + canonical |
| `/produk/[slug]` | Detail produk — spesifikasi teknis, harga, trust badges, produk terkait | **JSON-LD Product + Offer + FAQPage + BreadcrumbList** |
| `/insights` | Artikel HVAC dari CMS | Metadata artikel |
| `/insights/[slug]` | Detail artikel | Metadata artikel + canonical |
| `/admin` | CMS — login, dashboard, produk, artikel, SEO guide, settings, image intelligence, backup | `noindex` |
| `/sitemap.xml` | 623 URL — dihasilkan otomatis | ✅ |
| `/robots.txt` | Direktif per-bot + lokasi sitemap | ✅ |
| `/llms.txt` | Manifest untuk AI search engine | ✅ |

---

## 🏗️ Arsitektur

```text
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER PENGUNJUNG                        │
│   Filter · pencarian · keranjang · dwi-bahasa — instan, nol jeda │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 (App Router)                       │
│                                                                  │
│  Server Components  ──▶  src/lib/cms-db.ts (Drizzle ORM)         │
│  • /               ──▶  baca katalog, artikel, settings          │
│  • /produk/[slug]  ──▶  generateMetadata + JSON-LD per produk    │
│  • /insights       ──▶  artikel CMS terpublikasi                 │
│  • /admin          ──▶  CRUD + backup + image intelligence       │
│                        │                                         │
│                        ▼                                         │
│  ┌───────────────────────────────────────────┐                   │
│  │  PGLITE — PostgreSQL penuh dalam WASM     │                   │
│  │  db/pglite-data/ (persisten)              │                   │
│  │  8 tabel: products, categories,           │                   │
│  │  testimonials, cms_articles, articles,    │                   │
│  │  cms_settings, site_settings,             │                   │
│  │  product_image_assets                     │                   │
│  └───────────────────────────────────────────┘                   │
│                                                                  │
│  ⚙️ TANPA SERVER DATABASE EKSTERNAL — PostgreSQL tertanam!       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│           PIPELINE DATA (jalankan manual, hasil permanen)        │
│                                                                  │
│  prisma/seed.ts ──▶ db/custom.db (SQLite, 120 produk warisan)    │
│        │                                                         │
│        ▼  scripts/migrate-sqlite-to-pglite.ts                    │
│  PGlite ◀── scripts/generate-compressor-catalog.ts               │
│        │      (500 produk + 500 deskripsi SEO unik)              │
│        ▼                                                         │
│  620 produk final                                                │
└─────────────────────────────────────────────────────────────────┘
```

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · **PGlite (PostgreSQL WASM) + Drizzle ORM** · Prisma 6 (pipeline seed warisan) · Framer Motion · Zustand · Lucide Icons · `sharp` (pemrosesan gambar) · Z-AI SDK (generasi gambar AI)

> 💡 **Mengapa PGlite?** PostgreSQL sungguhan (bukan SQLite) — lengkap dengan tipe data, index, dan SQL standar — namun **tertanam langsung** di aplikasi: tanpa server database, tanpa kredensial, tanpa konfigurasi. Data persisten di folder `db/pglite-data/`. Deploy jadi serumit menyalin folder.

---

## 🚀 Mulai Cepat (3 Perintah)

```bash
# 1. Install dependensi + generate Prisma client + audit aset
bun run setup

# 2. Jalankan mode pengembangan
bun run dev          # → http://localhost:3000

# 3. Sebelum rilis — audit gambar + lint (wajib lolos 🟢)
bun run predeploy
```

> **Tanpa Bun?** Node.js 20+ juga bisa: `npm install` → `npm run db:generate` → `npm run dev`. Tapi Bun jauh lebih cepat: [bun.sh](https://bun.sh)

---

## 📜 Semua Perintah (Terverifikasi)

| Perintah | Fungsi |
|---|---|
| `bun run dev` | 🔥 Mode pengembangan di port 3000 (log otomatis ke `dev.log`) |
| `bun run build` | 📦 Build produksi Next.js |
| `bun run start` | 🌐 Jalankan server produksi (`next start`) |
| `bun run predeploy` | 🛡️ **WAJIB sebelum rilis** — audit totalitas gambar + lint |
| `bun run check:assets` | 🔍 Audit semua referensi gambar (DB + kode) vs file fisik |
| `bun run db:seed` | 🌱 Isi ulang SQLite warisan (sumber migrasi: 10 kategori, 120 produk, 7 testimoni) |
| `bun run db:push` | 📐 Terapkan skema Prisma ke SQLite |
| `bun run db:generate` | ⚙️ Generate Prisma Client |
| `bun run lint` | 🧹 Cek kualitas kode (ESLint) |
| `bun run setup` | 🎬 Instalasi awal lengkap untuk komputer baru |

**Skrip pipeline lanjutan** (jalankan dengan `bun scripts/<nama>.ts`):

| Skrip | Fungsi |
|---|---|
| `scripts/init-pglite-schema.ts` | 🏗️ Membuat 8 tabel + index di PGlite |
| `scripts/migrate-sqlite-to-pglite.ts` | 🚚 Migrasi data warisan SQLite → PGlite |
| `scripts/generate-compressor-catalog.ts` | 💥 **SUPER GENERATOR** — 500 produk + deskripsi SEO unik |
| `scripts/generate-base-compressor-images.ts` | 🤖 Bangkitkan 12 gambar kompresor studio via AI |
| `scripts/import-embraco-catalog.ts` | 📥 Impor katalog Embraco |
| `scripts/check-assets.ts` | 🛡️ Auditor totalitas aset |

---

## 🖼️ Pabrik Gambar & Katalog — Bagaimana 500 Produk Lahir

Ini adalah bagian paling ambisius dari proyek ini — dan cara kerjanya layak dipahami:

```text
   LANGKAH 1: KECERDASAN BUATAN            LANGKAH 2: TURUNAN MASSAL (sharp)
   ┌──────────────────────────┐            ┌───────────────────────────────┐
   │ 12 foto studio kompresor │            │ 1 base × badge brand berwarna │
   │ dibangkitkan AI:         │            │ × tint warna brand            │
   │ rotary, twin rotary,     │  ──────▶   │ × variasi zoom                │
   │ DC inverter, scroll,     │            │ = 500 gambar webp 800×800     │
   │ piston, semi-hermetik,   │            │   masing-masing UNIK          │
   │ screw, centrifugal,      │            │   + badge tipe/HP/refrigerant │
   │ condensing unit, heavy   │            │   + logo BMP                  │
   └──────────────────────────┘            └───────────────────────────────┘

   LANGKAH 3: DESKRIPSI SEO UNIK           LANGKAH 4: MASUK DATABASE
   ┌──────────────────────────┐            ┌───────────────────────────────┐
   │ 5 opener × 5 mid ×       │            │ PGlite: 620 produk, 19        │
   │ 5 closer template        │  ──────▶   │ kategori, sitemap bertambah   │
   │ + variabel brand/HP/     │            │ 623 URL, setiap halaman       │
   │ refrigerant/kota/aplikasi│            │ produk ber-JSON-LD penuh      │
   │ = 500 deskripsi bebas    │            │                               │
   │   duplikat               │            │                               │
   └──────────────────────────┘            └───────────────────────────────┘
```

**9 famili kompresor yang dihasilkan:** rotary (125) · twin-rotary (45) · DC inverter (60) · scroll (110) · scroll komersial (35) · piston hermetik (50) · semi-hermetik (40) · screw (20) · unit kondensor (15)

---

## 💚 SEO Playbook — Senjata Menuju #1 Google

### Yang sudah terpasang di dalam kode (tidak perlu disetel ulang):

| Senjata | Detail |
|---|---|
| 🧱 **JSON-LD `@graph`** | Organization + LocalBusiness (alamat, telepon, area served) + WebSite — di homepage |
| 🛒 **JSON-LD Produk** | `Product` + `Offer` (harga IDR, availability) + `seller` + `BreadcrumbList` + `FAQPage` 3 pertanyaan — di setiap halaman produk |
| 🗺️ **Sitemap otomatis** | 623 URL — semua produk, kategori, artikel |
| 🤖 **robots.txt dinamis** | Direktif eksplisit per-bot + lokasi sitemap |
| 🧠 **llms.txt** | Manifest khusus AI search engine (ChatGPT, Perplexity, Google AI) |
| 🏷️ **Metadata lengkap** | Title template, 25 kata kunci, canonical, OpenGraph `id_ID`, Twitter Card `summary_large_image` |
| 🔗 **Internal linking** | Section "Produk Terkait" di setiap detail produk — link juice mengalir |
| 📝 **500 deskripsi unik** | Nol duplikasi — Google membenci konten kembar |
| 🖼️ **`alt` deskriptif** | Semua gambar + heading semantik h1→h3 |
| ⚡ **Badge & harga terstruktur** | Harga Rupiah + availability terbaca crawler sebagai data penawaran |

### 8 Langkah pasca-deploy (5 menit, wajib):

1. ✅ Pastikan domain final sudah dipakai di `src/app/layout.tsx` (`metadataBase`) 
2. ✅ Buka [Google Search Console](https://search.google.com/search-console) → tambahkan properti domain Anda
3. ✅ Submit `https://domain-anda.com/sitemap.xml`
4. ✅ Buka [Bing Webmaster Tools](https://www.bing.com/webmasters) → impor dari Search Console (bonus gratis)
5. ✅ Uji [Rich Results Test](https://search.google.com/test/rich-results) pada 1 URL produk — harus terdeteksi *Product* + *FAQ*
6. ✅ Daftarkan bisnis di [Google Business Profile](https://business.google.com) — sinkron dengan JSON-LD LocalBusiness
7. ✅ Publish 2–4 artikel `/insights` per bulan via Admin CMS — konten adalah raja yang terus bermahkotai
8. ✅ Pantau `Performance` di Search Console mingguan — kata kunci naik, perkuat artikelnya

---

## 🎛️ Admin CMS — Kokpit Sang Administrator

Akses: `https://domain-anda.com/admin`

| Modul | Kemampuan |
|---|---|
| 📊 **Dashboard** | Ringkasan konten & status situs |
| 📦 **Products** | CRUD 620 produk — nama, harga, stok, brand, kategori, gambar |
| 📰 **Articles** | Tulis & publikasikan artikel SEO untuk `/insights` |
| 🧠 **Image Intelligence** | Analisis & pemrosesan gambar produk cerdas |
| 🧭 **SEO Guide** | Panduan SEO tertanam di dalam CMS |
| ⚙️ **Settings** | Pengaturan situs & CMS |
| 💾 **Backups** | Snapshot database — data tidak akan pernah hilang |

---

## 🌐 Fitur Dwi-Bahasa (ID/EN)

- Tombol **ID \| EN** di header (desktop & mobile menu)
- **320+ kunci terjemahan** — seluruh antarmuka ikut berganti
- Preferensi tersimpan permanen di browser (Zustand + persist)
- Nama & deskripsi produk tetap sesuai data asli distributor (praktik B2B yang benar)

---

## 🛡️ Jaminan Totalitas Gambar

> **Masalah lama:** pernah deploy lalu gambar tampil kosong semua? 😢
> **Solusi permanen:** di repo ini, *tidak mungkin lagi*.

```bash
bun run check:assets
```

```text
🔍 BERKAT MANDIRI PENDINGIN — AUDIT TOTALITAS ASET
📂 KATEGORI  → ✅ semua file ada          💻 REFERENSI KODE → ✅ semua path valid
📦 PRODUK    → ✅ semua path ada          ⭐ ASET BRAND     → ✅ logo + hero + favicon
🟢 SEMPURNA — TOTALITAS 100%! AMAN DEPLOY.
```

**Tiga penyebab "gambar kosong" di masa lalu — dan pembunuhnya:**

| # | Penyebab | Solusi permanen di repo ini |
|:-:|---|---|
| 1 | `DATABASE_URL` absolut — mesin lain tak punya path itu → DB kosong | ✅ Path relatif portabel + PGlite tertanam di folder proyek |
| 2 | Database tidak ikut ter-upload | ✅ `db/custom.db` (warisan) ter-track git; PGlite live di `db/pglite-data/`; ada backup snapshot di Admin CMS |
| 3 | Gambar direferensikan tapi filenya lupa di-upload | ✅ `check:assets` memblokir rilis (exit code ≠ 0) jika 1 file pun hilang |

---

## 🌍 Deploy — Panduan Jujur Sesuai Arsitektur

> ⚠️ **Penting & jujur:** sejak Era 500-Produk, website ini memakai **PGlite (database tertanam)** — artinya produksi butuh **runtime Node.js** (bukan lagi hosting statis seadanya). Kabar baiknya: tetap *jauh* lebih ringan dari PostgreSQL server biasa.

### 🅰️ VPS (Rekomendasi Utama — Nginx + PM2)

```bash
# di server
git clone <repo> && cd berkat-mandiri-pendingin
bun run setup                 # install + generate + audit aset
bun run build                 # build produksi
bunx pm2 start "bun run start" --name bmp   # daemon di port 3000
bunx pm2 save && bunx pm2 startup
```
```nginx
server {
    server_name berkatmandiripendingin.com www.berkatmandiripendingin.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
> SSL: `sudo certbot --nginx -d berkatmandiripendingin.com -d www.berkatmandiripendingin.com`

### 🅱️ Vercel / Netlify

Framework preset **Next.js** — build `bun run build`, tanpa output directory khusus. 
> ⚠️ Catatan: PGlite menulis ke disk — di platform serverless gunakan attach storage atau jalankan migrasi seed on-boot (lihat `scripts/init-pglite-schema.ts`).

### 🅲 cPanel (dengan fitur "Setup Node.js App")

1. Upload seluruh repo (tanpa `node_modules`, `.next`)
2. Buat Node.js App (versi 20+) → Application Root = folder repo → startup file: jalankan `bun run build && bun run start` via terminal cPanel
3. Tambahkan Reverse Proxy (bila ada): domain → `http://127.0.0.1:3000`

### 🔁 Update Konten Sehari-hari — **tanpa deploy!**

Produk, artikel, harga, stok: kelola langsung dari **Admin CMS** (`/admin`) — perubahan tersimpan di PGlite dan langsung tayang. Deploy ulang hanya perlu jika mengubah kode.

---

## 📂 Struktur Proyek

```text
berkat-mandiri-pendingin/
├── 📁 public/
│   └── 📁 images/
│       ├── 📁 categories/          # 10 gambar kategori
│       ├── 📁 products/kompresor/  # 512 gambar unik (12 base AI + 500 derivatif)
│       ├── 📁 hero/                # hero + OpenGraph image
│       └── 📄 logo.svg             # logo vektor (JSON-LD + favicon)
├── 📁 db/
│   ├── 📁 pglite-data/             # 💾 DATABASE LIVE — PostgreSQL tertanam (620 produk)
│   └── 📄 custom.db                # SQLite warisan — sumber pipeline seed
├── 📁 prisma/
│   ├── 📄 schema.prisma            # skema warisan: Category, Product, Testimonial…
│   └── 📄 seed.ts                  # seed lengkap — data tak pernah hilang
├── 📁 scripts/                     # 🏭 6 skrip pipeline (lihat tabel perintah)
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 page.tsx             # homepage 13 section + JSON-LD @graph
│   │   ├── 📁 produk/              # katalog + [slug] detail (SEO supercharge)
│   │   ├── 📁 insights/            # artikel CMS + [slug]
│   │   ├── 📁 admin/               # CMS: dashboard, products, articles,
│   │   │                           #      seo-guide, settings, backups, login
│   │   ├── 📄 layout.tsx           # metadata SEO lengkap + dwi-bahasa
│   │   ├── 📄 sitemap.ts           # 623 URL otomatis
│   │   └── 📄 robots.ts            # robots.txt dinamis
│   ├── 📁 components/
│   │   ├── 📁 berkat/              # 21 komponen homepage (Hero, Catalog, Footer…)
│   │   ├── 📁 cms/                 # komponen admin CMS
│   │   └── 📁 ui/                  # shadcn/ui lengkap
│   └── 📁 lib/
│       ├── 📄 cms-db.ts            # Drizzle ORM + PGlite client
│       ├── 📄 db.ts                # Prisma client (pipeline warisan)
│       ├── 📄 i18n.ts              # kamus dwi-bahasa 320+ kunci
│       ├── 📄 auth.ts              # autentikasi admin
│       └── 📄 product-image-*.ts   # kecerdasan & pemrosesan gambar
└── 📄 worklog.md                   # 📜 kronik 6 era pengembangan — BACA INI!
```

---

## 🆘 Troubleshooting

<details>
<summary><b>😭 "Gambar/katalog kosong semua!"</b></summary>

Jalankan `bun run check:assets` → harus 🟢. Lalu cek database live: folder `db/pglite-data/` harus ada dan terisi. Bila PGlite kosong di mesin baru: `bun scripts/init-pglite-schema.ts` → `bun prisma/seed.ts` → `bun scripts/migrate-sqlite-to-pglite.ts` → (opsional, katalog raksasa) `bun scripts/generate-compressor-catalog.ts`.
</details>

<details>
<summary><b>🐘 "Database PGlite error / tabel tidak ada"</b></summary>

PGlite data hidup di `db/pglite-data/`. Jika rusak/kosong: jalankan `bun scripts/init-pglite-schema.ts` (buat 8 tabel) lalu migrasikan ulang dari SQLite (`bun prisma/seed.ts` + `bun scripts/migrate-sqlite-to-pglite.ts`). Snapshot backup tersedia di Admin CMS → Backups.
</details>

<details>
<summary><b>🖼️ "Gambar 404 setelah deploy"</b></summary>

Pastikan folder `public/` (termasuk `public/images/products/kompresor/` — 512 file) ikut ter-deploy. Verifikasi lokal: `bun run build && bun run start` lalu buka `http://localhost:3000/produk`.
</details>

<details>
<summary><b>🚫 "Preview/iframe menolak koneksi (refused to connect)"</b></summary>

Header `X-Frame-Options: SAMEORIGIN` sengaja TIDAK dipasang agar situs bisa di-embed iframe lintas-origin (preview panel, dsb.). Jika suatu saat diaktifkan lagi, preview akan rusak — pakai CSP `frame-ancestors` sebagai gantinya. (Pelajaran Era V — lihat `worklog.md`.)
</details>

<details>
<summary><b>🌐 "Bahasa berubah sendiri di komputer lain?"</b></summary>

Itu fitur — preferensi bahasa tersimpan per-browser. Tekan tombol ID/EN untuk berganti kapan saja.
</details>

<details>
<summary><b>🔥 "Perubahan next.config.ts tidak berefek"</b></summary>

Config tidak di-hot-reload Turbopack. Stop server → `rm -rf .next` → `bun run dev` lagi.
</details>

---

## 🏛️ Kredit & Penghargaan

<div align="center">

| | |
|:-:|:-:|
| 🎯 **STRATEGIC CONSULTING** | 💻 **DIGITAL PLATFORM & SYSTEM** |
| **PT Top Konsultan Internasional** | **PT Digital Bisnis Manajemen** — [digiman.id](https://digiman.id) |

*Dirancang dengan standar konsultan kelas dunia. Dibangun dengan presisi kelas engineer.*

</div>

**PT Berkat Mandiri Pendingin** — Distributor HVAC resmi sejak 2010
📧 info@berkatmandiripendingin.com · ☎️ 081220030092 · 📱 WhatsApp +62 813-5000-3423 · 📍 Kawasan Industri MM2100, Bekasi

---

## 📄 Lisensi

Hak cipta © 2010–2026 **PT Berkat Mandiri Pendingin**. Seluruh hak cipta dilindungi.
Kode & desain: lisensi MIT.

<div align="center">
<sub>Dibangun dengan ❤️, teh ☕, dan determinasi 🔥 — supaya tidak pernah lagi ada gambar yang kosong, katalog yang sepi, dan halaman satu yang bukan milik kita.</sub>
</div>

---

<div align="center">

---

## 🇬🇧 English Documentation

### The Largest HVAC Compressor Catalog Ever Built with Next.js

**PT Berkat Mandiri Pendingin** — Indonesia's official HVAC distributor since 2010 (MM2100 Industrial Estate, Bekasi). A full-stack Next.js 16 marketing machine: **620 products** across **25 global brands**, powered by an embedded **PGlite (PostgreSQL WASM)** database, a complete **Admin CMS**, **512 unique AI-assisted product images**, and a five-layer structured-data SEO arsenal targeting **#1 on Google**.

#### Highlights
- 🛒 **620-product catalog** — 558 compressors in 9 families (rotary, twin-rotary, DC inverter, scroll, piston, semi-hermetic, screw, condensing units) across 19 categories
- 💚 **SEO total** — JSON-LD ×5 (Organization, LocalBusiness, WebSite, Product+Offer+FAQPage, BreadcrumbList), auto sitemap with **623 URLs**, dynamic robots.txt, `llms.txt` for AI search engines
- 🖼️ **512 unique images** — 12 AI-generated studio photos + 500 branded derivatives via `sharp` (webp 800×800)
- 🎛️ **Admin CMS** — products, articles, SEO guide, image intelligence, database backups at `/admin`
- 🌏 **Bilingual ID/EN** — 320+ translation keys, persistent preference
- 🛡️ **Asset totality guarantee** — `bun run check:assets` blocks any release with missing images (exit code 1)

#### Quick Start
```bash
bun run setup      # install + prisma generate + asset audit
bun run dev        # develop at http://localhost:3000
bun run predeploy  # MANDATORY before release — asset totality + lint
bun run build && bun run start   # production build + serve
```

#### Architecture in One Paragraph
Visitors get a fully interactive catalog (instant filtering, cart → WhatsApp ordering, bilingual UI). The Next.js 16 server reads from **PGlite** — a complete PostgreSQL compiled to WebAssembly, embedded in the app with persistent data in `db/pglite-data/`: **no external database server, no credentials, no setup**. Legacy seed data (120 products) ships in SQLite via Prisma; the catalog was scaled to 620 products by `scripts/generate-compressor-catalog.ts`, which also generated 500 unique SEO descriptions and 500 unique branded images.

#### Deployment (honest guide)
Production requires a Node.js runtime (PGlite writes to disk). **Recommended:** VPS + Nginx reverse proxy + PM2 (see the Indonesian section above for the complete config). Works on Vercel/Netlify with storage considerations, and on cPanel's Node.js App feature. Daily content updates need **no redeploy** — manage everything from the Admin CMS.

#### Credits
- 🎯 **Strategic Consulting** — PT Top Konsultan Internasional
- 💻 **Digital Platform & System** — PT Digital Bisnis Manajemen ([digiman.id](https://digiman.id))

---

<sub>© 2010–2026 PT Berkat Mandiri Pendingin · Code: MIT</sub>

</div>
