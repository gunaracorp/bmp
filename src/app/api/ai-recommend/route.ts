import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  criteriaHash,
  findMatchingProducts,
  isValidCriteria,
  normalizeCriteria,
  type FinderCriteria,
} from '@/lib/product-matcher';
import { getSalesDb, productMatches, recommendationHistory } from '@/lib/sales-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai-recommend
 * Body: { aplikasi, kapasitas, refrigeran, tipeSistem, budget, lokasi?, sessionId? }
 * Response: { items: MatchedProduct[], criteria: {...} }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json', message: 'Body harus JSON valid.' }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  if (!isValidCriteria(raw)) {
    return NextResponse.json(
      { error: 'invalid_criteria', message: 'Lengkapi semua pertanyaan finder (aplikasi, kapasitas, refrigeran, tipe sistem, budget).' },
      { status: 422 },
    );
  }

  const criteria: FinderCriteria = normalizeCriteria(raw as FinderCriteria);
  const sessionId = typeof raw.sessionId === 'string' ? raw.sessionId.slice(0, 80) : undefined;

  try {
    const items = await findMatchingProducts(criteria, 5);

    // Rekam riwayat rekomendasi + matches (analitik sales, best-effort).
    try {
      const hash = criteriaHash(criteria);
      const db = getSalesDb();
      const now = new Date();
      if (items.length > 0) {
        await db.insert(productMatches).values(
          items.map((item) => ({
            id: randomUUID(),
            productId: item.productId,
            criteriaHash: hash,
            score: item.compatibilityScore,
            reason: item.reason.slice(0, 500),
            createdAt: now,
          })),
        );
      }
      await db.insert(recommendationHistory).values({
        id: randomUUID(),
        sessionId: sessionId ?? null,
        productIds: JSON.stringify(items.map((item) => item.productId)),
        filtersJson: JSON.stringify({ ...criteria, sessionId: sessionId ?? null }),
        createdAt: now,
      });
    } catch (analyticsError) {
      console.error('[ai-recommend] gagal menyimpan analitik:', analyticsError);
    }

    return NextResponse.json({ items, criteria });
  } catch (error) {
    console.error('[ai-recommend] error:', error);
    return NextResponse.json(
      { error: 'recommendation_failed', message: 'Rekomendasi belum dapat diproses. Coba lagi sebentar.' },
      { status: 500 },
    );
  }
}
