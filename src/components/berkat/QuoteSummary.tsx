'use client';

/**
 * QuoteSummary — ringkasan quote: produk, qty, subtotal, estimasi instalasi,
 * total, status ketersediaan, dan CTA kirim ke WhatsApp.
 */
import { CheckCircle2, Clock3, Package, Truck } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { estimateInstallationFee } from '@/lib/quote-math';
import { WhatsAppLeadButton } from './WhatsAppLeadButton';

export type QuoteSummaryItem = {
  productId: string;
  productName: string;
  productSlug?: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  note?: string;
};

export type QuoteSummaryProps = {
  items: QuoteSummaryItem[];
  needInstallation: boolean;
  subtotal: number;
  installationFee?: number;
  totalEstimate: number;
  quoteId?: string;
  /** Mode read-only untuk halaman /quote/[id] (sudah tersimpan). */
  saved?: boolean;
  createdAt?: string;
  customer?: { name?: string | null; company?: string | null; city?: string | null };
  projectNote?: string | null;
};

export function QuoteSummary({
  items,
  needInstallation,
  subtotal,
  installationFee,
  totalEstimate,
  quoteId,
  saved = false,
  createdAt,
  customer,
  projectNote,
}: QuoteSummaryProps) {
  const fee = needInstallation ? (installationFee ?? estimateInstallationFee(subtotal)) : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Ringkasan Quote</h2>
          {quoteId ? <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{quoteId}</span> : null}
        </div>
        {saved && createdAt ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock3 className="size-3.5" aria-hidden="true" /> Dibuat {new Date(createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        ) : null}
      </div>

      <ul className="divide-y divide-slate-100 p-5">
        {items.map((item) => (
          <li key={item.productId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
              <Package className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {item.productSlug ? (
                  <a href={`/produk/${item.productSlug}`} className="transition hover:text-teal-800">{item.productName}</a>
                ) : item.productName}
              </p>
              <p className="text-xs text-slate-500">
                {item.brand ? `${item.brand} · ` : ''}{item.quantity} unit × {formatRupiah(item.unitPrice)}
              </p>
              {item.note ? <p className="mt-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600">{item.note}</p> : null}
            </div>
            <p className="shrink-0 text-sm font-bold text-slate-900">{formatRupiah(item.unitPrice * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-2.5 border-t border-slate-100 p-5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal produk</span>
          <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
        </div>
        {needInstallation ? (
          <div className="flex justify-between text-slate-600">
            <span>Estimasi jasa instalasi</span>
            <span className="font-semibold text-slate-900">{formatRupiah(fee)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 text-base">
          <span className="font-bold text-slate-900">Total estimasi</span>
          <span className="font-extrabold text-teal-800">{formatRupiah(totalEstimate)}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Estimasi harga distributor — harga final dikonfirmasi sales sesuai volume & lokasi pengiriman.
        </p>
      </div>

      {customer?.name || customer?.company || customer?.city || projectNote ? (
        <div className="border-t border-slate-100 p-5 text-sm">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Info proyek</p>
          <div className="grid gap-1 text-slate-700">
            {customer?.name ? <p>Nama: <span className="font-semibold">{customer.name}</span></p> : null}
            {customer?.company ? <p>Perusahaan: <span className="font-semibold">{customer.company}</span></p> : null}
            {customer?.city ? <p>Lokasi: <span className="font-semibold">{customer.city}</span></p> : null}
            {projectNote ? <p>Catatan: <span className="font-semibold">{projectNote}</span></p> : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-b-3xl border-t border-slate-100 bg-slate-50/60 p-5">
        <WhatsAppLeadButton
          variant="primary"
          className="w-full"
          label={saved ? 'Follow-up Quote via WhatsApp' : 'Kirim Quote ke WhatsApp'}
          source="quote"
          quoteId={quoteId}
          quotePayload={{
            items: items.map((item) => ({ productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice })),
            totalEstimate,
            customer: { name: customer?.name ?? undefined, company: customer?.company ?? undefined, city: customer?.city ?? undefined },
            needInstallation,
            note: projectNote ?? undefined,
          }}
        />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span className="flex flex-col items-center gap-1"><CheckCircle2 className="size-4 text-teal-700" /> Garansi resmi</span>
          <span className="flex flex-col items-center gap-1"><Truck className="size-4 text-teal-700" /> Kirim se-Indonesia</span>
          <span className="flex flex-col items-center gap-1"><Clock3 className="size-4 text-teal-700" /> Respon cepat</span>
        </div>
      </div>
    </div>
  );
}
