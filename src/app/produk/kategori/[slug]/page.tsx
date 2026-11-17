import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { getCatalogCategory, getCatalogProductsByCategory, getPublicCategories } from '@/lib/cms-db';

const SITE_URL = 'https://www.berkatmandiripendingin.com';
type RouteProps = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

type CategoryPageData = NonNullable<Awaited<ReturnType<typeof getCatalogCategory>>>;
type CategoryProductRow = Awaited<ReturnType<typeof getCatalogProductsByCategory>>[number];

function readSpecs(value: string | null | undefined): Record<string, string> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, string>
      : {};
  } catch {
    return {};
  }
}

function formatList(items: string[], max = 6): string {
  const unique = [...new Set(items.filter(Boolean))].slice(0, max);
  if (!unique.length) return '';
  if (unique.length === 1) return unique[0];
  return `${unique.slice(0, -1).join(', ')} dan ${unique[unique.length - 1]}`;
}

function categoryMeta(category: CategoryPageData, rows: CategoryProductRow[]) {
  const products = rows.filter((row) => row.product.inStock);
  const brands = products.map((row) => row.product.brand || '').filter(Boolean);
  const refrigerants = products
    .map((row) => readSpecs(row.product.specifications).refrigerant || '')
    .filter(Boolean);
  const brandLabel = formatList(brands, 8);
  const refrigerantLabel = formatList(refrigerants, 5);
  const title = `${category.name} Original Ready Stock — ${products.length} Model Distributor Resmi`;
  const description = [
    `Katalog ${category.name.toLowerCase()} original dari ${brandLabel || 'brand ternama dunia'}${refrigerantLabel ? ` untuk refrigerant ${refrigerantLabel}` : ''}.`,
    `${products.length} model ready stock di gudang MM2100 Bekasi dengan garansi resmi dan pengiriman ke 34 provinsi Indonesia.`,
    'Tanyakan harga distributor langsung via WhatsApp — tanpa markup perantara.',
  ].join(' ');
  const keywords = [
    `jual ${category.name.toLowerCase()}`,
    `${category.name.toLowerCase()} original`,
    `distributor ${category.name.toLowerCase()}`,
    ...(refrigerantLabel ? [`kompresor ${refrigerantLabel.toLowerCase()}`] : []),
    'berkat mandiri pendingin',
  ];
  return { title, description, keywords, products, brandLabel, refrigerantLabel };
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCatalogCategory(slug);
  if (!category) return { title: 'Kategori tidak ditemukan', robots: { index: false, follow: false } };
  const rows = await getCatalogProductsByCategory(slug);
  const { title, description, keywords } = categoryMeta(category, rows);
  const url = `${SITE_URL}/produk/kategori/${category.slug}`;
  const image = category.image || '/images/categories/kompresor.png';
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/produk/kategori/${category.slug}` },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [{ url: image, alt: `${category.name} — katalog Berkat Mandiri Pendingin` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function CategoryHubPage({ params }: RouteProps) {
  const { slug } = await params;
  const [category, rows, allCategories] = await Promise.all([
    getCatalogCategory(slug),
    getCatalogProductsByCategory(slug),
    getPublicCategories(),
  ]);
  if (!category) notFound();

  const { products, brandLabel, refrigerantLabel } = categoryMeta(category, rows);
  const canonicalUrl = `${SITE_URL}/produk/kategori/${category.slug}`;
  const siblings = allCategories.filter((item) => item.slug !== category.slug).slice(0, 11);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `Katalog ${category.name}`,
        description: category.description || `Kumpulan ${category.name.toLowerCase()} original dari distributor resmi Berkat Mandiri Pendingin.`,
        url: canonicalUrl,
        inLanguage: 'id-ID',
        isPartOf: { '@type': 'WebSite', name: 'Berkat Mandiri Pendingin', url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        name: `Daftar ${category.name} ready stock`,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 150).map(({ product }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/produk/${product.slug}`,
          name: product.name,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Katalog produk', item: `${SITE_URL}/produk` },
          { '@type': 'ListItem', position: 3, name: category.name, item: canonicalUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Berapa harga ${category.name.toLowerCase()} di Berkat Mandiri Pendingin?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Harga tidak kami tampilkan di website agar Anda selalu mendapat penawaran terbaik sesuai jumlah dan lokasi proyek. Tanyakan langsung via WhatsApp 0813-5000-3423 — tim sales membalas dengan harga distributor dan ketersediaan stok.',
            },
          },
          {
            '@type': 'Question',
            name: `Apakah ${category.name.toLowerCase()} ready stock dan bergaransi?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ya. Semua unit original distributor resmi, tersedia di gudang Kawasan Industri MM2100 Bekasi, bergaransi resmi, dan dikirim dengan packing standar logistik HVAC ke seluruh Indonesia.',
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f5f8f7] text-slate-950">
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm text-slate-600 sm:px-6 lg:px-8">
          <Link href="/" className="transition hover:text-teal-800">Beranda</Link>
          <span aria-hidden="true">/</span>
          <Link href="/produk" className="transition hover:text-teal-800">Katalog produk</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-slate-900">{category.name}</span>
        </div>
      </nav>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Katalog BMP · Distributor Resmi Sejak 2010</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{category.name} Original — Ready Stock Distributor</h1>
          <div className="mt-5 max-w-3xl space-y-4 text-sm leading-6 text-slate-700 sm:text-base">
            <p>
              {products.length > 0
                ? `Tersedia ${products.length} model ${category.name.toLowerCase()} original di gudang Kawasan Industri MM2100, Bekasi${brandLabel ? `, mencakup produk ${brandLabel}` : ''}${refrigerantLabel ? ` untuk aplikasi refrigerant ${refrigerantLabel}` : ''}. Setiap unit dijamin 100% original dengan garansi resmi distributor.`
                : `Kami melayani pengadaan ${category.name.toLowerCase()} original melalui jaringan distributor resmi. Konsultasikan kebutuhan Anda via WhatsApp — tim teknis kami membantu memilih model yang tepat.`}
            </p>
            {category.description && <p>{category.description}</p>}
            <p>
              Sejak 2010 PT Berkat Mandiri Pendingin menjadi satu pintu pengadaan HVAC untuk kontraktor, hotel, pabrik, mall, dan gedung komersial di seluruh Indonesia. Harga tidak kami pasang di website — Anda mendapat penawaran terbaik langsung via WhatsApp sesuai volume dan lokasi proyek, tanpa markup perantara.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/6281350003423?text=Halo%20Berkat%20Mandiri%20Pendingin%2C%20saya%20ingin%20konsultasi%20kebutuhan%20kompresor."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle aria-hidden="true" className="size-4" /> Konsultasi & Minta Penawaran
            </a>
            <Link href="/produk" className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
              Filter & pencarian model <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <li className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-teal-700" /> 100% original, garansi resmi</li>
            <li className="flex items-center gap-2"><Truck aria-hidden="true" className="size-4 text-teal-700" /> Kirim ke 34 provinsi Indonesia</li>
            <li className="flex items-center gap-2"><MessageCircle aria-hidden="true" className="size-4 text-teal-700" /> Harga terbaik via WhatsApp</li>
          </ul>
        </div>
      </section>

      {siblings.length > 0 && (
        <section aria-labelledby="kategori-lain" className="border-b border-slate-200 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h2 id="kategori-lain" className="text-sm font-semibold text-slate-900">Jelajahi kategori lainnya</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {siblings.map((item) => (
                <Link
                  key={item.id}
                  href={`/produk/kategori/${item.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-label={`Daftar produk ${category.name}`} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(({ product }) => {
              const specs = readSpecs(product.specifications);
              return (
                <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg">
                  <Link href={`/produk/${product.slug}`} className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-white p-5" aria-label={`Lihat spesifikasi ${product.name}`}>
                    {product.images ? (
                      <img src={product.images} alt={`${product.brand || ''} ${product.model || product.name} — ${category.name} original`} loading="lazy" className="size-full object-contain transition duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <span className="text-sm text-slate-500">Foto model belum tersedia</span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">{product.brand || 'Kompresor'}</p>
                    <h2 className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug">{product.model || product.name}</h2>
                    <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                      <div><dt className="text-slate-500">Refrigeran</dt><dd className="mt-0.5 font-semibold text-slate-800">{specs.refrigerant || 'Lihat detail'}</dd></div>
                      <div><dt className="text-slate-500">Daya</dt><dd className="mt-0.5 font-semibold text-slate-800">{specs.horsepower || specs.kapasitas_pk || 'Lihat detail'}</dd></div>
                    </dl>
                    <Link href={`/produk/${product.slug}`} className="mt-auto inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-teal-900 px-3 text-xs font-semibold text-white transition hover:bg-teal-800">
                      Spesifikasi lengkap <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Model untuk kategori ini akan segera kami unggah</h2>
            <p className="mt-2 text-sm text-slate-600">Tim kami dapat mencarikan unit yang Anda butuhkan dari jaringan distributor — tanyakan via WhatsApp.</p>
            <a href="https://wa.me/6281350003423" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700">Tanyakan ketersediaan</a>
          </div>
        )}

        <aside className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Pertanyaan yang sering diajukan — {category.name}</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900">Berapa harga {category.name.toLowerCase()} di sini?</h3>
              <p className="mt-1">Harga tidak ditampilkan di website agar Anda selalu mendapat penawaran terbaik sesuai jumlah dan lokasi proyek. Tanyakan langsung via WhatsApp 0813-5000-3423 — tim sales membalas dengan harga distributor dan ketersediaan stok.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Apakah ready stock dan bergaransi?</h3>
              <p className="mt-1">Ya. Semua unit original distributor resmi, tersedia di gudang Kawasan Industri MM2100 Bekasi, bergaransi resmi, dan dikirim dengan packing standar logistik HVAC ke seluruh Indonesia.</p>
            </div>
          </div>
        </aside>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    </main>
  );
}
