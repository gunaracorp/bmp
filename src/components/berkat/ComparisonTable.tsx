'use client';

/**
 * ComparisonTable — bandingkan hingga 4 produk berdasar spesifikasi teknis,
 * harga, refrigeran, dan kapasitas. Data dari sessionStorage (dipilih dari
 * AI finder atau katalog).
 */
import { useState } from 'react';
import Link from 'next/link';
import { GitCompareArrows, PlusCircle, Trash2, X } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { useQuoteStore } from '@/stores/quote-store';
import { COMPARE_MAX, useCompareList, type CompareItem } from './finder-types';
import { WhatsAppLeadButton } from './WhatsAppLeadButton';

export function ComparisonTable() {
  const { items, add, remove, clear } = useCompareList();
  const addItem = useQuoteStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState<string[]>([]);

  function handleAddQuote(item: CompareItem) {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    setJustAdded((prev) => [...prev, item.productId]);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <GitCompareArrows className="mx-auto size-10 text-slate-300" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Belum ada produk untuk dibandingkan</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
          Tambahkan produk lewat tombol “Banding” pada hasil AI Product Finder. Anda bisa membandingkan hingga {COMPARE_MAX} produk berdampingan.
        </p>
        <Link href="/ai-katalog" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-700">
          <PlusCircle className="size-4" /> Mulai dari AI Finder
        </Link>
      </div>
    );
  }

  const cheapest = Math.min(...items.map((item) => item.price));
  const bestScore = Math.max(...items.map((item) => item.compatibilityScore));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{items.length} produk dibandingkan</p>
        <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-red-600">
          <Trash2 className="size-3.5" /> Hapus semua
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">Tabel perbandingan produk HVAC</caption>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th scope="row" className="w-44 p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Spesifikasi</th>
              {items.map((item) => (
                <th key={item.productId} scope="col" className="min-w-[180px] p-4 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{item.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">{item.brand} · {item.category}</p>
                    </div>
                    <button type="button" onClick={() => remove(item.productId)} aria-label={`Hapus ${item.name} dari perbandingan`} className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                      <X className="size-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <Row label="Skor kecocokan">
              {items.map((item) => (
                <Td key={item.productId} highlight={item.compatibilityScore === bestScore}>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.compatibilityScore === bestScore ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800'}`}>
                    {item.compatibilityScore} / 100
                  </span>
                </Td>
              ))}
            </Row>
            <Row label="Harga / unit">
              {items.map((item) => (
                <Td key={item.productId} highlight={item.price === cheapest}>
                  <span className={`font-bold ${item.price === cheapest ? 'text-teal-800' : 'text-slate-900'}`}>{formatRupiah(item.price)}</span>
                </Td>
              ))}
            </Row>
            <Row label="Refrigeran">
              {items.map((item) => <Td key={item.productId}>{item.specs.refrigerant || '—'}</Td>)}
            </Row>
            <Row label="Kapasitas">
              {items.map((item) => <Td key={item.productId}>{item.specs.kapasitasHp ? `${item.specs.kapasitasHp} HP` : '—'}</Td>)}
            </Row>
            <Row label="Tipe kompresor">
              {items.map((item) => <Td key={item.productId}>{item.specs.kompresorType || item.category}</Td>)}
            </Row>
            <Row label="Tegangan">
              {items.map((item) => <Td key={item.productId}>{item.specs.tegangan || '—'}</Td>)}
            </Row>
            <Row label="Aplikasi rekomendasi">
              {items.map((item) => <Td key={item.productId}>{item.reason}</Td>)}
            </Row>
            <Row label="Aksi">
              {items.map((item) => (
                <Td key={item.productId}>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuote(item)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-teal-800 px-3 text-xs font-semibold text-white transition hover:bg-teal-700"
                    >
                      <PlusCircle className="size-3.5" /> {justAdded.includes(item.productId) ? 'Masuk quote ✓' : 'Tambah ke quote'}
                    </button>
                    <Link href={`/produk/${item.slug}`} className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      Detail
                    </Link>
                  </div>
                </Td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs leading-relaxed text-slate-600">
          Butuh bantuan memilih? Kirim perbandingan ini ke sales — kami rekomendasikan yang paling sesuai proyek Anda.
        </p>
        <WhatsAppLeadButton
          variant="primary"
          source="compare"
          needType="lainnya"
          quotePayload={{
            items: items.map((item) => ({ productName: item.name, quantity: 1, unitPrice: item.price })),
            totalEstimate: items.reduce((sum, item) => sum + item.price, 0),
          }}
        />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className="p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>
      {children}
    </tr>
  );
}

function Td({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return <td className={`p-4 align-top ${highlight ? 'bg-teal-50/50' : ''}`}>{children}</td>;
}
