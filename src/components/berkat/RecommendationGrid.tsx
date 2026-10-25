'use client';

/**
 * RecommendationGrid — kartu hasil rekomendasi AI Product Finder.
 * Menampilkan skor kecocokan, badge, alasan, dan CTA:
 * detail produk, tambah ke quote, bandingkan, tanya sales (WhatsApp).
 */
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, Check, GitCompareArrows, Loader2,
  PlusCircle, Sparkles, Thermometer, Zap,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { useQuoteStore } from '@/stores/quote-store';
import { addToCompare } from './finder-types';
import { WhatsAppLeadButton } from './WhatsAppLeadButton';
import type { FinderResultItem } from './finder-types';

const BADGE_STYLES: Record<string, string> = {
  'Paling cocok': 'bg-teal-700 text-white',
  Alternatif: 'bg-emerald-100 text-emerald-800',
  'Cocok untuk proyek besar': 'bg-amber-100 text-amber-900',
  'Banyak dipakai proyek serupa': 'bg-slate-100 text-slate-700',
  'Kelas industri': 'bg-cyan-100 text-cyan-900',
};

export function RecommendationGrid({ items }: { items: FinderResultItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">
          Belum ada produk yang cocok dengan kombinasi kriteria tersebut. Coba longgarkan budget atau pilih tipe sistem lain.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((item, index) => (
        <RecommendationCard key={item.productId} item={item} index={index} />
      ))}
    </div>
  );
}

function RecommendationCard({ item, index }: { item: FinderResultItem; index: number }) {
  const addItem = useQuoteStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [compareAdded, setCompareAdded] = useState(false);

  function handleAddQuote() {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleCompare() {
    const result = addToCompare(item);
    if (result.ok) setCompareAdded(true);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md ${index === 0 ? 'border-teal-600/60 ring-2 ring-teal-600/20' : 'border-slate-200'}`}
    >
      <div className="flex gap-4 p-5">
        {/* Gambar */}
        <div className="relative hidden size-28 shrink-0 overflow-hidden rounded-2xl bg-slate-50 sm:block">
          {item.image ? (
            <img src={item.image} alt={item.name} className="size-full object-contain p-2" loading="lazy" />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300"><Thermometer className="size-8" /></div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {item.badges.map((badge) => (
              <span key={badge} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_STYLES[badge] ?? 'bg-slate-100 text-slate-700'}`}>
                {badge === 'Paling cocok' ? <Sparkles className="size-3" aria-hidden="true" /> : null}
                {badge}
              </span>
            ))}
          </div>
          <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
            <Link href={`/produk/${item.slug}`} className="transition hover:text-teal-800">{item.name}</Link>
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{item.brand} · {item.category}</p>
          <p className="mt-2 text-lg font-bold text-teal-800">{formatRupiah(item.price)}<span className="text-xs font-medium text-slate-500"> /unit</span></p>
        </div>

        {/* Skor */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-50 py-3" aria-label={`Skor kecocokan ${item.compatibilityScore} dari 100`}>
          <span className="text-xl font-extrabold text-teal-800">{item.compatibilityScore}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">cocok</span>
          <div className="mt-1.5 h-1 w-10 overflow-hidden rounded-full bg-teal-200">
            <div className="h-full rounded-full bg-teal-700" style={{ width: `${item.compatibilityScore}%` }} />
          </div>
        </div>
      </div>

      {/* Alasan rekomendasi */}
      <div className="mx-5 mb-4 rounded-2xl bg-slate-50 p-3.5">
        <p className="flex gap-2 text-xs leading-relaxed text-slate-700">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
          {item.reason}
        </p>
        {item.specs.tegangan ? (
          <p className="mt-2 flex items-center gap-2 pl-6 text-[11px] text-slate-500">
            <Zap className="size-3" aria-hidden="true" /> {item.specs.tegangan} · {item.specs.kompresorType}
          </p>
        ) : null}
      </div>

      {/* CTA */}
      <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 p-4">
        <Link
          href={`/produk/${item.slug}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Lihat detail <ArrowRight className="size-4" />
        </Link>
        <button
          type="button"
          onClick={handleAddQuote}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-800 px-3 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          {added ? <Check className="size-4" /> : <PlusCircle className="size-4" />}
          {added ? 'Masuk quote' : 'Tambah ke quote'}
        </button>
        <WhatsAppLeadButton
          variant="compact"
          productName={item.name}
          productId={item.productId}
          estimate={item.price}
          source="ai-finder"
        />
        <button
          type="button"
          onClick={handleCompare}
          aria-label="Tambahkan ke perbandingan"
          className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition ${compareAdded ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          title="Bandingkan produk"
        >
          {compareAdded ? <Check className="size-4" /> : <GitCompareArrows className="size-4" />}
          <span className="sr-only sm:not-sr-only">Banding</span>
        </button>
      </div>
    </motion.article>
  );
}

export function RecommendationLoadingCard() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-10 text-sm font-medium text-slate-600">
      <Loader2 className="size-5 animate-spin text-teal-700" /> Menyiapkan rekomendasi terbaik…
    </div>
  );
}
