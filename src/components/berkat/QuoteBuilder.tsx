'use client';

/**
 * QuoteBuilder — keranjang quote B2B: ubah qty, catatan per item, kebutuhan
 * instalasi, data proyek → buat quote persisten → ringkasan + kirim WA.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClipboardList, FileText, Loader2, Minus, Plus, ShoppingBag,
  Trash2, Wrench,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { estimateInstallationFee } from '@/lib/quote-math';
import { useQuoteStore } from '@/stores/quote-store';
import { QuoteSummary } from './QuoteSummary';
import { getOrCreateSessionId } from './ProductFinderForm';

type CreatedQuoteView = {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    productSlug: string | null;
    brand: string | null;
    quantity: number;
    unitPrice: number;
    note: string | null;
  }>;
  subtotal: number;
  installationFee: number;
  totalEstimate: number;
  needInstallation: boolean;
  createdAt: string;
  customer: { name: string | null; company: string | null; city: string | null };
  projectNote: string | null;
};

export function QuoteBuilder() {
  const items = useQuoteStore((s) => s.items);
  const updateQuantity = useQuoteStore((s) => s.updateQuantity);
  const removeItem = useQuoteStore((s) => s.removeItem);
  const setNote = useQuoteStore((s) => s.setNote);
  const clearQuote = useQuoteStore((s) => s.clearQuote);
  const needInstallation = useQuoteStore((s) => s.needInstallation);
  const setNeedInstallation = useQuoteStore((s) => s.setNeedInstallation);
  const customerName = useQuoteStore((s) => s.customerName);
  const companyName = useQuoteStore((s) => s.companyName);
  const city = useQuoteStore((s) => s.city);
  const phone = useQuoteStore((s) => s.phone);
  const email = useQuoteStore((s) => s.email);
  const projectNote = useQuoteStore((s) => s.projectNote);
  const setCustomer = useQuoteStore((s) => s.setCustomer);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdQuote, setCreatedQuote] = useState<CreatedQuoteView | null>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const installationFee = needInstallation ? estimateInstallationFee(subtotal) : 0;
  const totalEstimate = subtotal + installationFee;

  async function createQuote() {
    if (items.length === 0) return;
    setCreating(true);
    setError('');
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          customer: { name: customerName, company: companyName, city, phone, email, needInstallation, note: projectNote },
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productSlug: item.slug,
            brand: item.brand,
            quantity: item.quantity,
            unitPrice: item.price,
            note: item.note,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message ?? 'Quote belum dapat dibuat. Coba lagi sebentar.');
        return;
      }
      setCreatedQuote(data.quote);
      clearQuote();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Koneksi bermasalah. Pastikan internet aktif lalu coba lagi.');
    } finally {
      setCreating(false);
    }
  }

  // ── Tampilan quote yang sudah dibuat ──
  if (createdQuote) {
    return (
      <div className="flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
        >
          <ClipboardList className="size-5 shrink-0" aria-hidden="true" />
          Quote {createdQuote.id} berhasil dibuat! Kirim ke WhatsApp untuk konfirmasi harga final & stok.
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Langkah selanjutnya</h2>
            <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">1</span> Kirim quote ke WhatsApp sales — pesan rincian sudah otomatis terformat.</li>
              <li className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">2</span> Sales mengecek stok, harga final, dan lead time (biasanya &lt; 1×24 jam kerja).</li>
              <li className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">3</span> Terima penawaran resmi + invoice, lalu jadwalkan pengiriman/instalasi.</li>
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCreatedQuote(null)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <Plus className="size-4" /> Buat quote baru
              </button>
              <Link href="/ai-katalog" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Cari produk lain
              </Link>
              <Link href={`/quote/${createdQuote.id}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <FileText className="size-4" /> Halaman quote shareable
              </Link>
            </div>
          </div>
          <QuoteSummary
            saved
            quoteId={createdQuote.id}
            createdAt={createdQuote.createdAt}
            items={createdQuote.items.map((item) => ({ ...item }))}
            needInstallation={createdQuote.needInstallation}
            subtotal={createdQuote.subtotal}
            installationFee={createdQuote.installationFee}
            totalEstimate={createdQuote.totalEstimate}
            customer={createdQuote.customer}
            projectNote={createdQuote.projectNote}
          />
        </div>
      </div>
    );
  }

  // ── Builder ──
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex flex-col gap-5">
        {/* Daftar item */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ShoppingBag className="size-5 text-teal-800" aria-hidden="true" /> Produk Quote ({items.length})
            </h2>
            {items.length > 0 ? (
              <button type="button" onClick={clearQuote} className="text-xs font-semibold text-slate-500 transition hover:text-red-600">
                Kosongkan semua
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-600">Keranjang quote masih kosong.</p>
              <p className="mt-1 text-xs text-slate-500">Tambahkan produk dari AI Finder atau katalog produk.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/ai-katalog" className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-700">
                  Coba AI Product Finder
                </Link>
                <Link href="/produk" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Jelajahi katalog
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start"
                  >
                    <div className="hidden size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-50 sm:block">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="size-full object-contain p-1.5" loading="lazy" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.slug ? <Link href={`/produk/${item.slug}`} className="transition hover:text-teal-800">{item.name}</Link> : item.name}
                      </p>
                      <p className="text-xs text-slate-500">{item.brand ? `${item.brand} · ` : ''}{formatRupiah(item.price)} /unit</p>
                      <input
                        type="text"
                        value={item.note ?? ''}
                        onChange={(event) => setNote(item.productId, event.target.value.slice(0, 300))}
                        placeholder="Catatan item (opsional)"
                        className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Kurangi ${item.name}`}
                          className="flex size-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Tambah ${item.name}`}
                          className="flex size-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <div className="w-24 text-right text-sm font-bold text-slate-900">{formatRupiah(item.price * item.quantity)}</div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Hapus ${item.name}`}
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Kebutuhan proyek */}
        {items.length > 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">Kebutuhan Proyek</h2>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-teal-50/40">
                <input
                  type="checkbox"
                  checked={needInstallation}
                  onChange={(event) => setNeedInstallation(event.target.checked)}
                  className="size-5 accent-teal-800"
                />
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Wrench className="size-4 text-teal-700" aria-hidden="true" />
                  Butuh jasa instalasi (+12%, min Rp 1,5 jt)
                </span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Nama
                  <input type="text" value={customerName} onChange={(event) => setCustomer({ customerName: event.target.value.slice(0, 100) })} placeholder="Nama Anda" className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Perusahaan
                  <input type="text" value={companyName} onChange={(event) => setCustomer({ companyName: event.target.value.slice(0, 120) })} placeholder="CV / PT (opsional)" className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Kota proyek
                  <input type="text" value={city} onChange={(event) => setCustomer({ city: event.target.value.slice(0, 80) })} placeholder="Contoh: Bekasi" className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Nomor WhatsApp
                  <input type="tel" value={phone} onChange={(event) => setCustomer({ phone: event.target.value.slice(0, 24) })} placeholder="08xxxxxxxxxx (opsional)" className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Catatan proyek
                <textarea value={projectNote} onChange={(event) => setCustomer({ projectNote: event.target.value.slice(0, 500) })} rows={3} placeholder="Kondisi proyek, deadline, preferensi pengiriman…" className="rounded-xl border border-input bg-background px-3.5 py-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
            </div>
          </div>
        ) : null}
      </div>

      {/* Panel sticky ringkasan */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <QuoteSummary
          items={items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productSlug: item.slug,
            brand: item.brand,
            quantity: item.quantity,
            unitPrice: item.price,
            note: item.note,
          }))}
          needInstallation={needInstallation}
          subtotal={subtotal}
          installationFee={installationFee}
          totalEstimate={totalEstimate}
          customer={{ name: customerName, company: companyName, city }}
          projectNote={projectNote}
        />
        {items.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={createQuote}
              disabled={creating}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-800 font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
            >
              {creating ? <Loader2 className="size-5 animate-spin" /> : <FileText className="size-5" />}
              {creating ? 'Membuat quote…' : 'Buat Quote'}
            </button>
            {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
