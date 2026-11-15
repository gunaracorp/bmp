/**
 * PGlite in-process client — PostgreSQL tertanam (WASM) di dalam aplikasi.
 *
 * Repo ini berjalan di environment sandbox tanpa server Postgres eksternal,
 * sementara `pg` Pool butuh DATABASE_URL. Data katalog (620 produk) sudah
 * ada di `db/pglite-data/`, maka semua akses DB kini melalui satu instance
 * PGlite yang di-cache di globalThis (aman terhadap HMR Next.js).
 *
 * Konstruktor `new PGlite()` bersifat sinkron — inisialisasi internal berjalan
 * asinkron dan setiap `.query()` otomatis menunggu `_checkReady`, sehingga
 * instance langsung aman dipakai drizzle tanpa proxy tambahan.
 *
 * Catatan lingkungan produksi (Neon): cukup set DATABASE_URL dan kembalikan
 * driver `drizzle-orm/node-postgres` di cms-db.ts bila ingin kembali memakai
 * Neon Postgres.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const globalForPglite = globalThis as typeof globalThis & {
  __bmpPglite?: PGlite;
};

export function resolvePgliteDataDir(): string {
  return process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
}

/**
 * Direktori runtime PostgreSQL yang dibuat initdb sebagai direktori KOSONG.
 * Environment sandbox yang di-recycle dapat menghilangkan direktori kosong
 * (isi file tetap ada), sehingga Postgres gagal start dengan FATAL
 * "could not open directory \"pg_notify\"" dan PGlite melempar
 * "PGlite failed to initialize properly". Fungsi ini memastikan semua
 * direktori tersebut ada sebelum instance PGlite dibuat — perbaikan
 * otomatis dan idempoten.
 */
const PGLITE_RUNTIME_DIRS = [
  'pg_commit_ts',
  'pg_dynshmem',
  'pg_logical/mappings',
  'pg_logical/snapshots',
  'pg_notify',
  'pg_replslot',
  'pg_serial',
  'pg_snapshots',
  'pg_stat',
  'pg_stat_tmp',
  'pg_tblspc',
  'pg_twophase',
  'pg_wal/archive_status',
  'pg_wal/summaries',
];

export function ensurePgliteRuntimeDirs(dataDir: string): void {
  try {
    for (const dir of PGLITE_RUNTIME_DIRS) {
      fs.mkdirSync(path.join(dataDir, dir), { recursive: true });
    }
  } catch {
    // Biarkan PGlite yang melaporkan error sebenarnya bila pembuatan gagal.
  }
}

/** Ambil (atau buat) instance PGlite tunggal — sinkron, siap dipakai langsung. */
export function getPgliteSync(): PGlite {
  if (!globalForPglite.__bmpPglite) {
    const dataDir = resolvePgliteDataDir();
    ensurePgliteRuntimeDirs(dataDir);
    globalForPglite.__bmpPglite = new PGlite(dataDir);
  }
  return globalForPglite.__bmpPglite;
}

/** Versi asinkron untuk skrip CLI (tetap satu instance yang sama). */
export async function getPglite(): Promise<PGlite> {
  const db = getPgliteSync();
  await db.waitReady;
  return db;
}
