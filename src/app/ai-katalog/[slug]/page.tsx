import { redirect } from 'next/navigation';

/**
 * /ai-katalog/[slug] — alias detail produk dari hasil AI finder.
 * Diarahkan ke halaman detail produk resmi /produk/[slug] agar SEO tetap
 * terkonsolidasi di satu URL kanonik.
 */
export default async function AiKatalogProductAliasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/produk/${encodeURIComponent(slug)}`);
}
