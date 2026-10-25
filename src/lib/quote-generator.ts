/**
 * Quote generator — buat quote persisten (dengan ID shareable) dari item
 * keranjang quote. Dipakai POST /api/quotes; hasilnya ditampilkan di
 * /quote/[id] dan langsung diarahkan ke WhatsApp sales.
 */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getSalesDb, quoteItems, salesQuotes } from '@/lib/sales-db';
import { generateLeadWhatsApp } from '@/lib/wa-message';
import { estimateInstallationFee } from '@/lib/quote-math';

export type QuoteItemInput = {
  productId: string;
  productName: string;
  productSlug?: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  note?: string;
};

export type QuoteCustomerInput = {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  city?: string;
  needInstallation?: boolean;
  note?: string;
};

export type CreatedQuote = {
  id: string;
  customer: {
    name: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
  };
  needInstallation: boolean;
  projectNote: string | null;
  items: Array<{
    productId: string;
    productName: string;
    productSlug: string | null;
    brand: string | null;
    quantity: number;
    unitPrice: number;
    note: string | null;
    lineTotal: number;
  }>;
  subtotal: number;
  installationFee: number;
  totalEstimate: number;
  createdAt: string;
  waUrl: string;
  waMessage: string;
};

/** Estimasi jasa instalasi — lihat src/lib/quote-math.ts. */
export { estimateInstallationFee, INSTALLATION_MIN_FEE, INSTALLATION_RATE } from '@/lib/quote-math';

export function formatQuoteId(): string {
  // Format ringkas: Q-<tanggal>-<random> — shareable dan enak dibaca sales.
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `Q-${stamp}-${rand}`;
}

export async function createQuote(
  itemsInput: QuoteItemInput[],
  customer: QuoteCustomerInput,
  sessionId?: string,
): Promise<CreatedQuote> {
  const items = itemsInput
    .filter((item) => item.productId && item.productName && Number.isFinite(item.quantity) && Number.isFinite(item.unitPrice))
    .map((item) => ({
      productId: item.productId.slice(0, 120),
      productName: item.productName.slice(0, 200),
      productSlug: item.productSlug?.slice(0, 200) ?? null,
      brand: item.brand?.slice(0, 80) ?? null,
      quantity: Math.min(Math.max(Math.round(item.quantity) || 1, 1), 999),
      unitPrice: Math.max(0, Math.round(item.unitPrice)),
      note: item.note?.slice(0, 300) ?? null,
    }));

  if (items.length === 0) throw new Error('QUOTE_EMPTY');

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const needInstallation = Boolean(customer.needInstallation);
  const installationFee = needInstallation ? estimateInstallationFee(subtotal) : 0;
  const totalEstimate = subtotal + installationFee;
  const id = formatQuoteId();
  const now = new Date();

  const db = getSalesDb();
  await db.insert(salesQuotes).values({
    id,
    sessionId: sessionId?.slice(0, 80) ?? null,
    customerName: customer.name?.slice(0, 100) ?? null,
    companyName: customer.company?.slice(0, 120) ?? null,
    phone: customer.phone?.slice(0, 24) ?? null,
    email: customer.email?.slice(0, 120) ?? null,
    kota: customer.city?.slice(0, 80) ?? null,
    status: 'draft',
    totalEstimate,
    needInstallation,
    projectNote: customer.note?.slice(0, 500) ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(quoteItems).values(
    items.map((item) => ({
      id: randomUUID(),
      quoteId: id,
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      brand: item.brand,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      note: item.note,
    })),
  );

  const wa = generateLeadWhatsApp({
    name: customer.name || 'Customer Website',
    company: customer.company,
    city: customer.city,
    needType: 'quote',
    estimate: totalEstimate,
    needInstallation,
    notes: customer.note,
    source: 'quote',
  });

  // Pesan WhatsApp quote memuat daftar item — susun versi khusus.
  const itemLines = items
    .map((item, index) => `${index + 1}. ${item.productName} — ${item.quantity} unit`)
    .join('\n');
  const waMessage =
    `Halo Berkat Mandiri Pendingin, saya sudah membuat quote ${id}.\n\n` +
    `Nama: ${customer.name || 'Customer Website'}\n` +
    (customer.company ? `Perusahaan: ${customer.company}\n` : '') +
    (customer.city ? `Lokasi proyek: ${customer.city}\n` : '') +
    `\nRincian quote:\n${itemLines}\n\n` +
    `Subtotal: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subtotal)}\n` +
    (needInstallation ? `Estimasi instalasi: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(installationFee)}\n` : '') +
    `Total estimasi: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalEstimate)}\n` +
    (customer.note ? `Catatan: ${customer.note}\n` : '') +
    `\nMohon konfirmasi harga final dan ketersediaannya. Terima kasih.`;

  return {
    id,
    customer: {
      name: customer.name ?? null,
      company: customer.company ?? null,
      phone: customer.phone ?? null,
      email: customer.email ?? null,
      city: customer.city ?? null,
    },
    needInstallation,
    projectNote: customer.note ?? null,
    items: items.map((item) => ({ ...item, lineTotal: item.unitPrice * item.quantity })),
    subtotal,
    installationFee,
    totalEstimate,
    createdAt: now.toISOString(),
    waUrl: wa.url,
    waMessage,
  };
}

export async function getQuoteWithItems(id: string) {
  const db = getSalesDb();
  const [quote] = await db.select().from(salesQuotes).where(eq(salesQuotes.id, id)).limit(1);
  if (!quote) return null;
  const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id));
  return { quote, items };
}
