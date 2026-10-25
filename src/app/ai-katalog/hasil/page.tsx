'use client';

/**
 * /ai-katalog/hasil — menampilkan 3–5 rekomendasi produk terbaik.
 * Data dibaca dari sessionStorage (diisi ProductFinderForm) agar hasil
 * bertahan saat refresh dan bisa diakses tanpa submit ulang.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { RecommendationGrid } from '@/components/berkat/RecommendationGrid';
import { WhatsAppLeadButton } from '@/components/berkat/WhatsAppLeadButton';
import { APLIKASI_OPTIONS, BUDGET_OPTIONS, KAPASITAS_OPTIONS, TIPE_SISTEM_OPTIONS } from '@/lib/finder-options';
import { FINDER_RESULT_KEY } from '@/components/berkat/ProductFinderForm';
import type { FinderResult } from '@/components/berkat/finder-types';

const APLIKASI_LABEL = Object.fromEntries(APLIKASI_OPTIONS.map((o) => [o.value, o.label]));
const KAPASITAS_LABEL = Object.fromEntries(KAPASITAS_OPTIONS.map((o) => [o.value, o.label]));
const TIPE_LABEL = Object.fromEntries(TIPE_SISTEM_OPTIONS.map((o) => [o.value, o.label]));
const BUDGET_LABEL = Object.fromEntries(BUDGET_OPTIONS.map((o) => [o.value, o.label]));

export default function AiKatalogHasilPage() {
  const [result, setResult] = useState<FinderResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(FINDER_RESULT_KEY);
      if (raw) setResult(JSON.parse(raw) as FinderResult);
    } catch {
      setResult(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f8f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/ai-katalog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Ubah kriteria
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/quote" className="font-semibold text-teal-800 transition hover:text-teal-700">Quote Saya</Link>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <Link href="/compare" className="font-semibold text-teal-800 transition hover:text-teal-700">Banding</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!loaded ? (
          <p className="text-center text-sm text-slate-500">Memuat hasil…</p>
        ) : !result ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <SlidersHorizontal className="mx-auto size-10 text-slate-300" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">Belum ada hasil rekomendasi</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Isi dulu 5 pertanyaan AI Product Finder — sistem akan merekomendasikan model paling cocok untuk proyek Anda.
            </p>
            <Link href="/ai-katalog" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-700">
              <RotateCcw aria-hidden="true" className="size-4" /> Mulai finder
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                {result.items.length} rekomendasi terbaik untuk proyek Anda
              </h1>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                <Chip label="Aplikasi" value={APLIKASI_LABEL[result.criteria.aplikasi] ?? result.criteria.aplikasi} />
                <Chip label="Kapasitas" value={KAPASITAS_LABEL[result.criteria.kapasitas] ?? `±${result.criteria.kapasitas} HP`} />
                <Chip label="Refrigeran" value={result.criteria.refrigeran} />
                <Chip label="Tipe" value={TIPE_LABEL[result.criteria.tipeSistem] ?? result.criteria.tipeSistem} />
                <Chip label="Budget" value={BUDGET_LABEL[result.criteria.budget] ?? result.criteria.budget} />
                {result.criteria.lokasi ? <Chip label="Lokasi" value={result.criteria.lokasi} icon /> : null}
              </div>
            </div>

            <RecommendationGrid items={result.items} />

            <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-teal-200 bg-teal-50/60 p-6 text-center">
              <h2 className="text-lg font-bold text-slate-900">Belum yakin memilih?</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Kirim kriteria + model yang Anda minati ke sales kami — kami bantu hitung kapasitas, cek stok, dan siapkan penawaran resmi.
              </p>
              <div className="mt-4 flex justify-center">
                <WhatsAppLeadButton
                  variant="primary"
                  source="ai-finder"
                  needType={result.criteria.aplikasi}
                  productName={result.items[0]?.name}
                  estimate={result.items[0]?.price}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Chip({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
      {icon ? <MapPin aria-hidden="true" className="size-3.5 text-teal-700" /> : null}
      <span className="text-slate-500">{label}:</span> {value}
    </span>
  );
}
