import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getSalesDb, leadRequests } from '@/lib/sales-db';
import { generateLeadWhatsApp } from '@/lib/wa-message';
import { normalizeLead } from '@/lib/lead-normalizer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads — simpan lead dari WhatsApp Lead Flow, balas dengan URL
 * WhatsApp yang sudah terformat (nama, kebutuhan, model, estimasi, lokasi).
 * Body: { name, company?, phone?, email?, city?, needType?, description?,
 *         productId?, productName?, quantity?, estimate?, source?, quoteId? }
 * Response: { lead: {...}, waUrl, waMessage }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json', message: 'Body harus JSON valid.' }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const normalized = normalizeLead(raw);
  if (!normalized.ok) {
    return NextResponse.json(
      { error: 'validation_failed', errors: normalized.errors, message: normalized.errors.join(' ') },
      { status: 422 },
    );
  }

  const productId = typeof raw.productId === 'string' ? raw.productId.slice(0, 120) : null;
  const productName = typeof raw.productName === 'string' ? raw.productName.slice(0, 200) : null;
  const quantity = Number.isFinite(Number(raw.quantity)) ? Math.min(Math.max(Math.round(Number(raw.quantity)), 1), 999) : undefined;
  const estimate = Number.isFinite(Number(raw.estimate)) ? Math.max(0, Number(raw.estimate)) : undefined;
  const source = typeof raw.source === 'string' ? raw.source.slice(0, 40) : 'website';
  const quoteId = typeof raw.quoteId === 'string' ? raw.quoteId.slice(0, 40) : null;

  try {
    const id = randomUUID();
    const db = getSalesDb();
    const now = new Date();

    await db.insert(leadRequests).values({
      id,
      quoteId,
      name: normalized.data.name,
      company: normalized.data.company,
      phone: normalized.data.phone,
      email: normalized.data.email,
      city: normalized.data.city,
      needType: normalized.data.needType,
      description: normalized.data.description,
      source: source.slice(0, 40),
      status: 'baru',
      createdAt: now,
      updatedAt: now,
    });

    const wa = generateLeadWhatsApp({
      name: normalized.data.name,
      company: normalized.data.company ?? undefined,
      city: normalized.data.city ?? undefined,
      needType: normalized.data.needType ?? undefined,
      productName: productName ?? undefined,
      quantity,
      estimate,
      notes: normalized.data.description ?? undefined,
      productUrl: productName ? undefined : undefined,
      source: (['ai-finder', 'quote', 'product', 'compare'].includes(source) ? source : 'contact') as 'ai-finder' | 'quote' | 'product' | 'compare' | 'contact',
    });

    // Deskripsi lead mencantumkan model yang dipilih agar sales langsung paham.
    if (productName && !normalized.data.description?.includes(productName)) {
      const updatedDescription = `${normalized.data.description ? `${normalized.data.description} · ` : ''}Model: ${productName}${quantity ? ` × ${quantity}` : ''}`;
      await db.update(leadRequests).set({ description: updatedDescription.slice(0, 1000) }).where(eq(leadRequests.id, id));
    }

    return NextResponse.json({
      lead: { id, ...normalized.data, source, quoteId },
      waUrl: wa.url,
      waMessage: wa.message,
    }, { status: 201 });
  } catch (error) {
    console.error('[leads] error:', error);
    return NextResponse.json(
      { error: 'lead_failed', message: 'Lead belum dapat disimpan. Coba lagi sebentar.' },
      { status: 500 },
    );
  }
}
