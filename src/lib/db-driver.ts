/**
 * BMP Database Driver — DUAL DRIVER pintar + FAILOVER RESILIENT.
 *
 * - Bila DATABASE_URL ter-set (postgres://, mis. Neon di Vercel): semua akses
 *   DB memakai driver `pg` (node-postgres) via Pool → data PERSISTEN.
 * - Bila tidak (sandbox dev / mode offline): fallback ke PGlite in-process
 *   (db/pglite-data) — perilaku lama tetap utuh.
 *
 * FAILOVER (ketahanan produksi): bila database remote TIDAK TERJANGKAU —
 * kredensial salah (28P01), Neon compute bermasalah (080xx/53300), DNS/TCP
 * gagal (ECONNREFUSED/ENOTFOUND/ETIMEDOUT) — driver OTOMATIS pindah ke
 * snapshot PGlite sehingga SITUS PUBLIK TETAP HIDUP (degraded: tulisan baru
 * bersifat ephemeral). Saat DATABASE_URL diperbaiki + redeploy, mode remote
 * permanen aktif kembali. Error non-koneksi (mis. SQL salah) TIDAK memicu
 * failover — dilempar apa adanya.
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
  __bmpPgPool?: ResilientPool;
  __bmpRemoteFailover?: RemoteFailover;
};

/** Mode remote (Neon/Postgres) aktif?
 * HANYA URL ber-skema postgres:// (atau postgresql://) yang dianggap remote.
 * URL lain seperti sisa scaffold `file:/...db/custom.db` (ada di .env sandbox)
 * HARUS diabaikan — kalau tidak, pg Pool mencoba konek ke "file:" dan semua
 * query gagal padahal seharusnya fallback PGlite.
 */
export function isRemoteDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? '';
  return /^postgres(ql)?:\/\//i.test(url);
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

/* ─────────────────────────── FAILOVER ─────────────────────────── */

/** SQLSTATE / errno yang berarti remote TIDAK BISA DIHUBUNGI → failover. */
const CONN_FAIL_CODES = new Set([
  // Autentikasi/role
  '28P01', '28000', '28P00',
  // Koneksi (SQLSTATE class 08)
  '08000', '08001', '08003', '08004', '08006', '08010', '08011',
  // Kapasitas/instansi
  '53300', '57P03',
  // Error sistem Node
  'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN',
]);

function isConnectionAuthError(err: unknown): boolean {
  const code = (err as { code?: unknown })?.code;
  return typeof code === 'string' && CONN_FAIL_CODES.has(code);
}

type RemoteFailover = {
  dead: boolean;
  lastCode?: string;
  lastError?: string;
  activatedAt?: string;
};

function failoverState(): RemoteFailover {
  if (!globalForDb.__bmpRemoteFailover) globalForDb.__bmpRemoteFailover = { dead: false };
  return globalForDb.__bmpRemoteFailover;
}

export function getRemoteFailoverState(): RemoteFailover {
  return { ...failoverState() };
}

function markRemoteDead(err: unknown): void {
  const st = failoverState();
  if (st.dead) return;
  const e = err as Error & { code?: string };
  st.dead = true;
  st.lastCode = e.code;
  st.lastError = typeof e.message === 'string' ? e.message.slice(0, 300) : String(e);
  st.activatedAt = new Date().toISOString();
  console.warn(
    `[DB] REMOTE TIDAK TERJANGKAU (${e.code ?? e.name}: ${st.lastError}) → FALLBACK PGlite EPHEMERAL. ` +
      'Situs tetap hidup; perbaiki DATABASE_URL lalu REDEPLOY agar data permanen aktif kembali.',
  );
}

/**
 * Jalankan query di PGlite (snapshot lokal/tmp) — bentuk hasil seragam.
 *
 * TRANSLASI PROTOKOL: drizzle-orm/node-postgres memanggil client dengan
 * DUA gaya — `client.query(sql, params)` (raw) dan `client.query({name,
 * text, rowMode:'array', types}, params)` (prepared). PGlite hanya menerima
 * STRING — objek yang diteruskan mentah memicu "invalid message format"
 * (08P01) dan mencemari sesi. Fungsi ini menormalkan kedua gaya; bila
 * rowMode 'array' diminta, dipakai dukungan rowMode NATIVE PGlite agar
 * urutan kolom identik dengan pg (aman untuk JOIN kolom duplikat).
 */
type PgQueryArg = string | { name?: string; text?: string; values?: unknown[]; rowMode?: string };

async function pgliteQuery<T = Record<string, unknown>>(
  arg: PgQueryArg,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const sql = typeof arg === 'string' ? arg : arg.text ?? '';
  if (!sql) throw new Error('[DB] Query kosong — konfigurasi drizzle tidak dikenali oleh PGlite');
  const values = typeof arg === 'string' ? params : params ?? arg.values ?? [];
  const pglite = getPgliteSync();
  // rowMode 'array' native PGlite: urutan kolom persis seperti pg — AMAN
  // untuk JOIN dengan nama kolom duplikat (konversi manual via nama justru
  // merusak mapping drizzle).
  const wantArrayRow = typeof arg === 'object' && arg.rowMode === 'array';
  const result = wantArrayRow
    ? await pglite.query<unknown[]>(sql, values as unknown[], { rowMode: 'array' })
    : await pglite.query<Record<string, unknown>>(sql, values as unknown[]);
  return { rows: result.rows as T[], rowCount: result.affectedRows ?? result.rows.length };
}

/* ──────────────────── POOL REMOTE RESILIENT ──────────────────── */

export type ResilientPool = {
  query: <T = Record<string, unknown>>(arg: PgQueryArg, params?: unknown[]) => Promise<{ rows: T[]; rowCount: number }>;
  connect: () => Promise<StickyRawClient>;
  end: () => Promise<void>;
};

export function getRemotePool(): ResilientPool {
  if (!globalForDb.__bmpPgPool) {
    const primary = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      ssl: resolveSsl(),
      // Neon compute bisa cold start — gagal cepat dengan pesan jelas,
      // jangan menggantung sampai Lambda timeout (yang menyembunyikan
      // penyebab aslinya).
      connectionTimeoutMillis: 15000,
    });
    primary.on('error', (err) => {
      console.error('[DB] Pool error:', err.message);
    });
    const host = (() => {
      try {
        return new URL(process.env.DATABASE_URL ?? '').host;
      } catch {
        return '(host tidak terbaca)';
      }
    })();
    console.log(`[DB] Mode REMOTE — PostgreSQL @ ${host}`);

    globalForDb.__bmpPgPool = {
      query: async <T>(text: string, params?: unknown[]) => {
        const st = failoverState();
        if (!st.dead) {
          try {
            const r = await primary.query<T>(text, params as unknown[]);
            return { rows: r.rows, rowCount: r.rowCount ?? r.rows.length };
          } catch (err) {
            if (isConnectionAuthError(err)) markRemoteDead(err);
            else throw err;
          }
        }
        return pgliteQuery<T>(text, params);
      },
      connect: async () => {
        const st = failoverState();
        if (!st.dead) {
          try {
            const client = await primary.connect();
            let released = false;
            return {
              query: async <T>(text: string, params?: unknown[]) => {
                if (!failoverState().dead) {
                  try {
                    const r = await client.query<T>(text, params as unknown[]);
                    return { rows: r.rows, rowCount: r.rowCount ?? r.rows.length };
                  } catch (err) {
                    if (isConnectionAuthError(err)) {
                      markRemoteDead(err);
                      if (!released) {
                        released = true;
                        client.release();
                      }
                    } else throw err;
                  }
                }
                return pgliteQuery<T>(text, params);
              },
              release: () => {
                if (!released) {
                  released = true;
                  client.release();
                }
              },
            };
          } catch (err) {
            if (isConnectionAuthError(err)) markRemoteDead(err);
            else throw err;
          }
        }
        return { query: pgliteQuery, release: () => undefined };
      },
      end: () => primary.end(),
    };
  }
  return globalForDb.__bmpPgPool;
}

/**
 * Buat instance drizzle untuk kedua mode.
 * Definisi schema pg-core identik — API query sama persis.
 */
export function createBmpDrizzle(schema?: Record<string, unknown>): BmpDrizzle {
  if (isRemoteDatabase()) {
    return drizzleNodePg(getRemotePool() as unknown as Pool, { schema: schema as never }) as BmpDrizzle;
  }
  return drizzlePglite(getPgliteSync(), { schema: schema as never }) as BmpDrizzle;
}

// Union longgar: API yang dipakai aplikasi (select/insert/update/delete/
// execute/transaction) tersedia di kedua driver dengan tanda tangan yang sama.
export type BmpDrizzle = NodePgDatabase<Record<string, never>> | ReturnType<typeof drizzlePglite>;

/** Raw SQL seragam untuk kedua mode (dengan failover otomatis di mode remote). */
export async function rawDbQuery<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  if (isRemoteDatabase()) {
    return getRemotePool().query<T>(text, params);
  }
  return pgliteQuery<T>(text, params);
}

export type StickyRawClient = {
  query: <T = Record<string, unknown>>(arg: PgQueryArg, params?: unknown[]) => Promise<{ rows: T[]; rowCount: number }>;
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
      query: pgliteQuery,
      release: () => undefined,
    };
  }
  let sticky: StickyRawClient | null = null;
  return {
    query: async <T>(text: string, params?: unknown[]) => {
      if (!sticky) sticky = await getRemotePool().connect();
      return sticky.query<T>(text, params);
    },
    release: () => {
      sticky?.release();
      sticky = null;
    },
  };
}
