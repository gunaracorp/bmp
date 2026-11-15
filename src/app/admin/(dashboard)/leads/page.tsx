import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import {
  Download, Flame, FileSpreadsheet, MessageSquareText, TrendingUp, Users,
} from 'lucide-react';
import { getSalesDb, leadRequests, recommendationHistory, salesQuotes } from '@/lib/sales-db';
import { LEAD_STATUS_FLOW } from '@/lib/lead-normalizer';
import { updateLeadStatusAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leads & Quote — Admin BMP',
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  baru: 'bg-emerald-100 text-emerald-800',
  dibalas: 'bg-cyan-100 text-cyan-900',
  dikonfirmasi: 'bg-teal-100 text-teal-900',
  quote_dibuat: 'bg-amber-100 text-amber-900',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-slate-200 text-slate-600',
};

const STATUS_LABEL: Record<string, string> = {
  baru: 'Baru',
  dibalas: 'Dibalas',
  dikonfirmasi: 'Dikonfirmasi',
  quote_dibuat: 'Quote dibuat',
  closed_won: 'Closed won',
  closed_lost: 'Closed lost',
};

type PageProps = { searchParams: Promise<{ status?: string; source?: string }> };

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = LEAD_STATUS_FLOW.includes(params.status as never) ? params.status : '';
  const sourceFilter = (params.source ?? '').trim().slice(0, 40);

  const db = getSalesDb();
  const [leads, quotes, stats, recommendations] = await Promise.all([
    (statusFilter
      ? db.select().from(leadRequests).where(eq(leadRequests.status, statusFilter)).orderBy(desc(leadRequests.createdAt)).limit(100)
      : db.select().from(leadRequests).orderBy(desc(leadRequests.createdAt)).limit(100)),
    db.select().from(salesQuotes).orderBy(desc(salesQuotes.createdAt)).limit(50),
    db.select({ status: leadRequests.status, count: sql<number>`count(*)::int` }).from(leadRequests).groupBy(leadRequests.status),
    db.select({ count: sql<number>`count(*)::int` }).from(recommendationHistory),
  ]);

  const statusCount = Object.fromEntries(stats.map((row) => [row.status, Number(row.count)]));
  const totalLeads = stats.reduce((sum, row) => sum + Number(row.count), 0);
  const newLeads = statusCount['baru'] ?? 0;
  const wonLeads = statusCount['closed_won'] ?? 0;
  const totalRecommendations = Number(recommendations[0]?.count ?? 0);
  const totalQuotes = quotes.length;

  const filteredLeads = sourceFilter
    ? leads.filter((lead) => lead.source === sourceFilter)
    : leads;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Leads & Quote</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pipeline penjualan dari AI Product Finder, Quote Builder, dan WhatsApp Lead Flow.
          </p>
        </div>
        <a
          href="/api/admin/leads/export"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Download aria-hidden="true" className="size-4" /> Export CSV
        </a>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total leads" value={String(totalLeads)} hint={`${newLeads} belum dibalas`} />
        <KpiCard icon={TrendingUp} label="Rekomendasi AI" value={String(totalRecommendations)} hint="kali finder dijalankan" />
        <KpiCard icon={FileSpreadsheet} label="Quote dibuat" value={String(totalQuotes)} hint="dari Quote Builder" />
        <KpiCard icon={Flame} label="Closed won" value={String(wonLeads)} hint={totalLeads > 0 ? `${Math.round((wonLeads / totalLeads) * 100)}% konversi` : '—'} />
      </div>

      {/* Filter status */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/admin/leads" active={!statusFilter && !sourceFilter} label={`Semua (${totalLeads})`} />
        {LEAD_STATUS_FLOW.map((status) => (
          <FilterChip
            key={status}
            href={`/admin/leads?status=${status}`}
            active={statusFilter === status}
            label={`${STATUS_LABEL[status]} (${statusCount[status] ?? 0})`}
          />
        ))}
      </div>

      {/* Tabel leads */}
      <section className="overflow-hidden rounded-2xl border border-border bg-white">
        <h2 className="border-b border-border px-5 py-4 text-sm font-semibold text-slate-900">
          Daftar leads {sourceFilter ? `— sumber: ${sourceFilter}` : ''}
        </h2>
        {filteredLeads.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Belum ada lead masuk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nama / Perusahaan</th>
                  <th className="px-4 py-3 font-semibold">Kontak</th>
                  <th className="px-4 py-3 font-semibold">Kebutuhan</th>
                  <th className="px-4 py-3 font-semibold">Sumber</th>
                  <th className="px-4 py-3 font-semibold">Waktu</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="align-top transition hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      {lead.company ? <p className="text-xs text-slate-500">{lead.company}</p> : null}
                      {lead.city ? <p className="text-xs text-slate-500">{lead.city}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-xs leading-relaxed text-slate-700">
                      {lead.phone ? <p><span className="font-semibold">WA:</span> +{lead.phone}</p> : null}
                      {lead.email ? <p className="break-all">{lead.email}</p> : null}
                    </td>
                    <td className="max-w-[240px] px-4 py-4 text-xs leading-relaxed text-slate-700">
                      {lead.needType ? <p className="font-semibold capitalize">{lead.needType.replaceAll('-', ' ')}</p> : null}
                      {lead.description ? <p className="line-clamp-3 text-slate-600">{lead.description}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <MessageSquareText aria-hidden="true" className="size-3" /> {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {new Date(lead.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-4">
                      <form
                        className="flex flex-col gap-2"
                        action={async (formData: FormData) => {
                          'use server';
                          await updateLeadStatusAction(String(formData.get('leadId')), String(formData.get('status')));
                        }}
                      >
                        <input type="hidden" name="leadId" value={lead.id} />
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[lead.status] ?? 'bg-slate-100 text-slate-700'}`}>
                          {STATUS_LABEL[lead.status] ?? lead.status}
                        </span>
                        <label className="sr-only" htmlFor={`status-${lead.id}`}>Ubah status</label>
                        <select
                          id={`status-${lead.id}`}
                          name="status"
                          defaultValue={lead.status}
                          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
                        >
                          {LEAD_STATUS_FLOW.map((status) => (
                            <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                          ))}
                        </select>
                        <button type="submit" className="h-8 rounded-lg bg-slate-900 px-2.5 text-xs font-semibold text-white transition hover:bg-slate-700">
                          Simpan
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quote terbaru */}
      <section className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Quote terbaru</h2>
          <Link href="/admin/leads" className="text-xs font-semibold text-teal-800 hover:underline">Refresh</Link>
        </div>
        {quotes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Belum ada quote dibuat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Kota</th>
                  <th className="px-4 py-3 font-semibold text-right">Total estimasi</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-semibold text-teal-800">
                      <Link href={`/quote/${quote.id}`} className="hover:underline">{quote.id}</Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{quote.customerName || '—'}</p>
                      {quote.companyName ? <p className="text-xs text-slate-500">{quote.companyName}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{quote.kota || '—'}</td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(quote.totalEstimate)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{quote.status}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {new Date(quote.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="size-4 text-teal-700" aria-hidden="true" /> {label}
      </div>
      <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold transition ${active ? 'bg-teal-800 text-white' : 'border border-border bg-white text-slate-700 hover:bg-slate-50'}`}
    >
      {label}
    </Link>
  );
}
