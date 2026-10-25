'use client';

/**
 * WhatsAppLeadButton — WhatsApp Lead Flow: modal singkat (nama, perusahaan,
 * kota, kebutuhan, jumlah, catatan) → POST /api/leads → buka wa.me dengan
 * pesan otomatis terformat. Minim friction: form bisa diisi 20 detik.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircle, X } from 'lucide-react';
import { formatRupiah } from '@/lib/format';

type Variant = 'compact' | 'primary' | 'link';

export type WhatsAppLeadButtonProps = {
  variant?: Variant;
  className?: string;
  label?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  estimate?: number;
  needType?: string;
  source?: 'ai-finder' | 'quote' | 'product' | 'contact' | 'compare';
  quoteId?: string;
  /** Item quote lengkap (untuk sumber 'quote'). */
  quotePayload?: {
    items: Array<{ productName: string; quantity: number; unitPrice: number }>;
    totalEstimate: number;
    customer?: { name?: string; company?: string; city?: string };
    needInstallation?: boolean;
    note?: string;
  };
};

export function WhatsAppLeadButton({
  variant = 'primary',
  className = '',
  label,
  productId,
  productName,
  quantity,
  estimate,
  needType,
  source = 'contact',
  quoteId,
  quotePayload,
}: WhatsAppLeadButtonProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: quotePayload?.customer?.name ?? '',
    company: quotePayload?.customer?.company ?? '',
    city: quotePayload?.customer?.city ?? '',
    description: '',
  });

  const displayLabel = label ?? (variant === 'compact' ? 'Tanya sales' : 'Chat Sales via WhatsApp');

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    setSending(true);
    setError('');
    try {
      let body: Record<string, unknown> = {
        name: form.name,
        company: form.company,
        city: form.city,
        description: form.description,
        source,
        quoteId,
      };

      if (quotePayload) {
        // Mode quote — produk & estimasi dari payload quote.
        body = {
          ...body,
          needType,
          productName: quotePayload.items.map((item) => `${item.productName} × ${item.quantity}`).join('; ').slice(0, 400),
          estimate: quotePayload.totalEstimate,
        };
      } else {
        body = { ...body, productId, productName, quantity, estimate, needType };
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message ?? 'Lead belum dapat dikirim. Coba lagi sebentar.');
        return;
      }
      // Buka WhatsApp dengan pesan terformat, lalu tutup modal.
      window.open(data.waUrl, '_blank', 'noopener,noreferrer');
      setOpen(false);
    } catch {
      setError('Koneksi bermasalah. Pastikan internet aktif lalu coba lagi.');
    } finally {
      setSending(false);
    }
  }

  const triggerButton = variant === 'compact' ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 text-sm font-semibold text-white transition hover:bg-emerald-600 ${className}`}
      title="Kirim kebutuhan via WhatsApp"
    >
      <MessageCircle className="size-4" />
      <span className="sr-only sm:not-sr-only">{displayLabel}</span>
    </button>
  ) : variant === 'link' ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 ${className}`}
    >
      <MessageCircle className="size-4" /> {displayLabel}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 font-semibold text-white shadow-sm transition hover:bg-emerald-600 ${className}`}
    >
      <MessageCircle className="size-5" /> {displayLabel}
    </button>
  );

  return (
    <>
      {triggerButton}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => !sending && setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Kirim kebutuhan ke sales via WhatsApp"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Butuh konsultasi cepat?</h3>
                  <p className="mt-0.5 text-sm text-slate-600">Isi singkat, sales langsung membalas via WhatsApp.</p>
                </div>
                <button type="button" onClick={() => !sending && setOpen(false)} aria-label="Tutup" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                  <X className="size-5" />
                </button>
              </div>

              {quotePayload ? (
                <div className="mb-4 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                  <p className="font-semibold text-slate-900">Ringkasan quote Anda:</p>
                  <p className="mt-1">{quotePayload.items.map((item) => `${item.productName} × ${item.quantity}`).join(' · ')}</p>
                  <p className="mt-1 font-semibold text-teal-800">Total estimasi: {formatRupiah(quotePayload.totalEstimate)}</p>
                </div>
              ) : productName ? (
                <div className="mb-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Model diminati:</span> {productName}
                  {estimate ? <span className="ml-1 text-teal-800">({formatRupiah(estimate)})</span> : null}
                </div>
              ) : null}

              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Nama *
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Nama Anda"
                      className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Perusahaan
                    <input
                      type="text"
                      value={form.company}
                      onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                      placeholder="CV / PT (opsional)"
                      className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Kota proyek
                    <input
                      type="text"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="Contoh: Bekasi"
                      className="h-11 rounded-xl border border-input bg-background px-3.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Jumlah unit
                    <input
                      type="number"
                      min={1}
                      max={999}
                      defaultValue={quantity ?? 1}
                      value={quantity}
                      readOnly={Boolean(quantity)}
                      className="h-11 rounded-xl border border-input bg-muted/40 px-3.5 outline-none"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Kebutuhan / catatan
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Contoh: untuk cold room 20 m³, butuh garansi resmi"
                    rows={3}
                    maxLength={500}
                    className="rounded-xl border border-input bg-background px-3.5 py-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>

                {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">{error}</p> : null}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? <Loader2 className="size-5 animate-spin" /> : <MessageCircle className="size-5" />}
                  {sending ? 'Menyiapkan WhatsApp…' : 'Kirim ke WhatsApp Sales'}
                </button>
                <p className="text-center text-[11px] leading-relaxed text-slate-500">
                  Data Anda membantu sales menyiapkan penawaran terbaik. Kami tidak membagikannya ke pihak lain.
                </p>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
