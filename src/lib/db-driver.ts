/**
 * BMP Database Driver — DUAL DRIVER pintar.
 *
 * - Bila DATABASE_URL ter-set (mis. Neon Postgres di Vercel): semua akses DB
 *   memakai driver `pg` (node-postgres) via Pool → data PERSISTEN.
 * - Bila tidak (sandbox dev / mode offline): fallback ke PGlite in-process
 *   (db/pglite-data) — perilaku lama tetap utuh.
 *
 * Pergantian mode TANPA mengubah kode query: semua definisi tabel memakai
 * drizzle pg-core yang identik untuk kedua driver.
 *
 * ENV:
 * - DATABASE_URL       → aktifkan mode remote (Neon/Postgres)
 * - DATABASE_POOL_MAX  → batas koneksi Pool (default 5)
 */
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import { getPgliteSync } from '@/lib/pglite-client';

const globalForDb = globalThis as typeof globalThis & {
  __bmpPgPool?: Pool;
};

/** Mode remote (Neon/Postgres) aktif? */
export function isRemoteDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** SSL otomatis: hormati sslmode di URL; host managed cloud default TLS. */
function resolveSsl(): boolean | { rejectUnauthorized: boolean } | undefined {
  const url = process.env.DATABASE_URL ?? '';
  if (/sslmode=(disable|prefer|require|verify-ca|verify-full)/.test(url)) {
    return undefined; // pg mem-parse sslmode dari connection string sendiri
  }
  if (/(neon\.tech|supabase\.(co|com)|amazonaws\.com|render\.com|azure\.com)/.test(url)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

/** Pool pg bersama (satu per instance) — dipakai drizzle & raw client. */
export function getRemotePool(): Pool {
  if (!globalForDb.__bmpPgPool) {
    globalForDb.__bmpPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      ssl: resolveSsl(),
    });
    globalForDb.__bmpPgPool.on('error', (err) => {
      console.error('[DB] Pool error:', err.message);
    });
    console.log('[DB] Mode REMOTE — PostgreSQL via DATABASE_URL');
  }
  return globalForDb.__bmpPgPool;
}

/**
 * Buat instance drizzle untuk kedua mode.
 * Definisi schema pg-core identik — API query sama persis.
 */
export function createBmpDrizzle(schema?: Record<string, unknown>): BmpDrizzle {
  if (isRemoteDatabase()) {
    return drizzleNodePg(getRemotePool(), { schema: schema as never }) as BmpDrizzle;
  }
  return drizzlePglite(getPgliteSync(), { schema: schema as never }) as BmpDrizzle;
}

// Union longgar: API yang dipakai aplikasi (select/insert/update/delete/
// execute) tersedia di kedua driver dengan tanda tangan yang sama.
export type BmpDrizzle = NodePgDatabase<Record<string, never>> | ReturnType<typeof drizzlePglite>;

/** Raw SQL seragam untuk kedua mode. */
export async function rawDbQuery<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  if (isRemoteDatabase()) {
    const result = await getRemotePool().query<T>(text, params as unknown[]);
    return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
  }
  const pglite = getPgliteSync();
  const result = await pglite.query<T>(text, params);
  return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
}

export type StickyRawClient = {
  query: <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<{ rows: T[]; rowCount: number }>;
  release: () => void;
};

/**
 * Client raw dengan jaminan SATU koneksi untuk banyak query — wajib untuk
 * transaksi eksplisit (BEGIN ... COMMIT) di mode Pool (pool biasa bisa
 * memberi koneksi berbeda per query). Di mode PGlite selalu satu koneksi.
 * Pola pakai: query() berkali-kali → release() di akhir/finally.
 */
export function createStickyRawClient(): StickyRawClient {
  if (!isRemoteDatabase()) {
    return {
      query: rawDbQuery,
      release: () => undefined,
    };
  }
  let sticky: PoolClient | null = null;
  return {
    query: async <T>(text: string, params?: unknown[]) => {
      if (!sticky) sticky = await getRemotePool().connect();
      const result = await sticky.query<T>(text, params as unknown[]);
      return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
    },
    release: () => {
      sticky?.release();
      sticky = null;
    },
  };
}
