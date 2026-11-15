import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { ProductFinderForm } from '@/components/berkat/ProductFinderForm';

export const metadata: Metadata = {
  title: 'AI Product Finder — Temukan Kompresor Terbaik untuk Proyek Anda',
  description: 'Jawab 5 pertanyaan singkat, sistem kami merekomendasikan 3–5 model kompresor & sistem pendingin yang paling cocok untuk cold room, freezer, supermarket, chiller, atau pabrik Anda. Harga distributor, langsung quote.',
  keywords: ['ai product finder', 'rekomendasi kompresor', 'kompresor cold room', 'kompresor chiller', 'konsultasi pendingin'],
  alternates: { canonical: '/ai-katalog' },
  openGraph: {
    type: 'website',
    url: '/ai-katalog',
    title: 'AI Product Finder | Berkat Mandiri Pendingin',
    description: 'Temukan kompresor yang tepat untuk proyek Anda dalam 1 menit — tanpa browsing ribuan produk.',
  },
};

export default function AiKatalogPage() {
  return (
    <main className="min-h-screen bg-[#f5f8f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Berkat Mandiri Pendingin
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/quote" className="font-semibold text-teal-800 transition hover:text-teal-700">Quote Saya</Link>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <Link href="/compare" className="font-semibold text-teal-800 transition hover:text-teal-700">Banding</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-800">
            <BrainCircuit aria-hidden="true" className="size-3.5" /> AI Product Finder
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Temukan kompresor yang tepat untuk proyek Anda
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Jawab 5 pertanyaan singkat — sistem kami mencocokkan kebutuhan aplikasi, kapasitas, refrigeran,
            dan budget dengan katalog 600+ produk, lalu merekomendasikan model paling cocok lengkap dengan
            estimasi harga distributor.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="size-4 text-teal-700" /> Skor kecocokan transparan</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="size-4 text-teal-700" /> Langsung buat quote</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="size-4 text-teal-700" /> Follow-up via WhatsApp</span>
          </div>
        </div>

        <div className="mx-auto mt-9 max-w-4xl">
          <ProductFinderForm />
        </div>
      </section>
    </main>
  );
}
