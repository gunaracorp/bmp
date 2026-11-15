import { NextResponse } from 'next/server';
import { createQuote, getQuoteWithItems, type QuoteCustomerInput, type QuoteItemInput } from '@/lib/quote-generator';
import { normalizePhone } from '@/lib/lead-normalizer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quotes — buat quote baru dari keranjang.
 * Body: { items: QuoteItemInput[], customer?: QuoteCustomerInput, sessionId? }
 * Response: { quote: CreatedQuote }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json', message: 'Body harus JSON valid.' }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: QuoteItemInput[] = rawItems.slice(0, 30).map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      productId: String(item.productId ?? '').slice(0, 120),
      productName: String(item.productName ?? '').slice(0, 200),
      productSlug: item.productSlug ? String(item.productSlug).slice(0, 200) : undefined,
      brand: item.brand ? String(item.brand).slice(0, 80) : undefined,
      quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), 999),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
      note: item.note ? String(item.note).slice(0, 300) : undefined,
    };
  });

  const customerRaw = ((raw.customer ?? {}) as Record<string, unknown>);
  const phone = customerRaw.phone ? normalizePhone(String(customerRaw.phone)) : null;
  const customer: QuoteCustomerInput = {
    name: customerRaw.name ? String(customerRaw.name).slice(0, 100) : undefined,
    company: customerRaw.company ? String(customerRaw.company).slice(0, 120) : undefined,
    phone: phone ?? (customerRaw.phone ? String(customerRaw.phone).slice(0, 24) : undefined),
    email: customerRaw.email ? String(customerRaw.email).slice(0, 120) : undefined,
    city: customerRaw.city ? String(customerRaw.city).slice(0, 80) : undefined,
    needInstallation: Boolean(customerRaw.needInstallation),
    note: customerRaw.note ? String(customerRaw.note).slice(0, 500) : undefined,
  };

  const sessionId = typeof raw.sessionId === 'string' ? raw.sessionId.slice(0, 80) : undefined;

  try {
    const quote = await createQuote(items, customer, sessionId);
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'QUOTE_EMPTY') {
      return NextResponse.json(
        { error: 'quote_empty', message: 'Keranjang quote masih kosong. Tambahkan produk terlebih dahulu.' },
        { status: 422 },
      );
    }
    console.error('[quotes] error:', error);
    return NextResponse.json(
      { error: 'quote_failed', message: 'Quote belum dapat dibuat. Coba lagi sebentar.' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/quotes?id=Q-xxx — ambil detail quote untuk halaman share /quote/[id].
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get('id') ?? '').trim();
  if (!id) {
    return NextResponse.json({ error: 'missing_id', message: 'Parameter id wajib diisi.' }, { status: 400 });
  }
  try {
    const result = await getQuoteWithItems(id);
    if (!result) {
      return NextResponse.json({ error: 'not_found', message: 'Quote tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[quotes] GET error:', error);
    return NextResponse.json({ error: 'quote_failed', message: 'Quote belum dapat dimuat.' }, { status: 500 });
  }
}
