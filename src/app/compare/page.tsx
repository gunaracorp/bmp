import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, GitCompareArrows } from 'lucide-react';
import { ComparisonTable } from '@/components/berkat/ComparisonTable';

export const metadata: Metadata = {
  title: 'Bandingkan Produk | Berkat Mandiri Pendingin',
  description: 'Bandingkan hingga 4 produk kompresor & sistem pendingin berdampingan: harga, refrigeran, kapasitas, dan tipe kompresor.',
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-[#f5f8f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Berkat Mandiri Pendingin
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/ai-katalog" className="font-semibold text-teal-800 transition hover:text-teal-700">AI Finder</Link>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <Link href="/quote" className="font-semibold text-teal-800 transition hover:text-teal-700">Quote Saya</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-800">
            <GitCompareArrows aria-hidden="true" className="size-3.5" /> Perbandingan Produk
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Bandingkan produk</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
            Pilih produk terbaik dengan membandingkan spesifikasi teknis, harga distributor, dan skor kecocokan berdampingan.
          </p>
        </div>
        <ComparisonTable />
      </section>
    </main>
  );
}
