import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { QuoteBuilder } from '@/components/berkat/QuoteBuilder';

export const metadata: Metadata = {
  title: 'Quote Builder — Buat Penawaran Instan | Berkat Mandiri Pendingin',
  description: 'Susun daftar produk HVAC, atur jumlah unit, tambah kebutuhan instalasi, dan kirim quote ke WhatsApp sales. Estimasi harga distributor dalam 1–2 menit.',
  robots: { index: false, follow: true },
};

export default function QuotePage() {
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
            <Link href="/compare" className="font-semibold text-teal-800 transition hover:text-teal-700">Banding</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-800">
            <ClipboardList aria-hidden="true" className="size-3.5" /> Quote Builder
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Buat quote Anda</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
            Atur jumlah unit, catatan item, dan kebutuhan instalasi — lalu kirim ringkasan quote ke WhatsApp
            sales. Total estimasi diperbarui real-time.
          </p>
        </div>
        <QuoteBuilder />
      </section>
    </main>
  );
}
