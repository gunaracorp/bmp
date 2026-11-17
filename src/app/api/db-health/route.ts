/**
 * DIAGNOSTIK DATABASE — /api/db-health
 *
 * Tujuan: melihat kondisi nyata DB di lingkungan hosting (mis. Vercel)
 * TANPA membuka kredensial: mode aktif (remote/PGlite), sanitasi DATABASE_URL
 * (host & sslmode saja), hasil query nyata + nama/pesan error bila gagal.
 *
 * Memudahkan diagnosis "server-side exception": cukup curl /api/db-health.
 * Selalu respons 200 JSON — error DB dilaporkan di dalam payload, bukan crash.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getRemoteFailoverState, isRemoteDatabase, rawDbQuery } from '@/lib/db-driver';
import { resolvePgliteDataDir } from '@/lib/pglite-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Sanitasi DATABASE_URL: HANYA metadata aman — tanpa user/password. */
function sanitizeDbUrl(url: string | undefined) {
  if (!url) return { set: false };
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    return {
      set: true,
      scheme: u.protocol.replace(':', ''),
      host: u.host,
      database: u.pathname || '(kosong)',
      sslmode: u.searchParams.get('sslmode'),
      hasUser: Boolean(u.username),
      hasPassword: Boolean(u.password),
      // Deteksi kesalahan paste umum di Vercel: nilai terbungkus tanda kutip
      wrappedInQuotes: /^['"].*['"]$/.test(trimmed),
      length: trimmed.length,
    };
  } catch {
    return {
      set: true,
      malformed: true,
      wrappedInQuotes: /^['"].*['"]$/.test(trimmed),
      // Cukup bentuk umum, JANGAN isi nilainya (bisa mengandung kredensial)
      startsWith: trimmed.slice(0, 12).replace(/[^a-zA-Z0-9_]+/g, '#'),
    };
  }
}

export async function GET() {
  const report: Record<string, unknown> = {
    time: new Date().toISOString(),
    node: process.version,
    mode: isRemoteDatabase() ? 'remote' : 'pglite',
    databaseUrl: sanitizeDbUrl(process.env.DATABASE_URL),
    remoteFailover: getRemoteFailoverState(),
  };

  // 1) Query nyata sesuai mode aktif — error ditangkap bersih (tanpa crash)
  try {
    const t0 = Date.now();
    const r = await rawDbQuery<{ n: string }>('SELECT COUNT(*)::text AS n FROM products');
    const cats = await rawDbQuery<{ n: string }>('SELECT COUNT(*)::text AS n FROM categories');
    const arts = await rawDbQuery<{ n: string }>('SELECT COUNT(*)::text AS n FROM cms_articles');
    report.dbQuery = {
      ok: true,
      ms: Date.now() - t0,
      products: r.rows[0]?.n ?? '?',
      categories: cats.rows[0]?.n ?? '?',
      cmsArticles: arts.rows[0]?.n ?? '?',
    };
  } catch (err) {
    const e = err as Error & { code?: string };
    report.dbQuery = {
      ok: false,
      name: e.name,
      code: e.code,
      message: typeof e.message === 'string' ? e.message.slice(0, 400) : String(e),
    };
  }

  // 2) Ketersediaan snapshot PGlite (jalur fallback)
  const dir = resolvePgliteDataDir();
  report.pgliteSnapshot = {
    path: dir,
    present: fs.existsSync(path.join(dir, 'PG_VERSION')),
  };

  return Response.json(report, { headers: { 'Cache-Control': 'no-store' } });
}
