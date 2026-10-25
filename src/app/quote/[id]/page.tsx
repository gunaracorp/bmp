import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { QuoteSummary } from '@/components/berkat/QuoteSummary';
import { getQuoteWithItems } from '@/lib/quote-generator';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Detail Quote | Berkat Mandiri Pendingin',
  robots: { index: false, follow: false },
};

/**
 * /quote/[id] — halaman quote shareable. Sales bisa membuka link ini untuk
 * melihat rincian quote yang dikirim customer via WhatsApp.
 */
export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getQuoteWithItems(id).catch(() => null);
  if (!result) notFound();

  const { quote, items } = result;
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#f5f8f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Berkat Mandiri Pendingin
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
            <FileText aria-hidden="true" className="size-3.5" /> {quote.id}
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Quote {quote.id}</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Status: <span className="font-semibold capitalize text-teal-800">{quote.status}</span> — sales akan
            mengonfirmasi harga final & ketersediaan stok melalui WhatsApp.
          </p>
        </div>

        <QuoteSummary
          saved
          quoteId={quote.id}
          createdAt={quote.createdAt.toISOString()}
          items={items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug ?? undefined,
            brand: item.brand ?? undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            note: item.note ?? undefined,
          }))}
          needInstallation={quote.needInstallation}
          subtotal={subtotal}
          totalEstimate={quote.totalEstimate}
          customer={{ name: quote.customerName, company: quote.companyName, city: quote.kota }}
          projectNote={quote.projectNote}
        />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-900">Tautan halaman ini bisa dibagikan</p>
          <p className="mt-1">
            Simpan URL <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">/quote/{quote.id}</code> untuk
            membuka kembali quote ini kapan pun — cocok untuk diteruskan ke tim purchasing atau sales.
          </p>
        </div>
      </section>
    </main>
  );
}
