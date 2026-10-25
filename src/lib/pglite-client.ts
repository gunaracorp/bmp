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
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const globalForPglite = globalThis as typeof globalThis & {
  __bmpPglite?: PGlite;
};

export function resolvePgliteDataDir(): string {
  return process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
}

/** Ambil (atau buat) instance PGlite tunggal — sinkron, siap dipakai langsung. */
export function getPgliteSync(): PGlite {
  if (!globalForPglite.__bmpPglite) {
    globalForPglite.__bmpPglite = new PGlite(resolvePgliteDataDir());
  }
  return globalForPglite.__bmpPglite;
}

/** Versi asinkron untuk skrip CLI (tetap satu instance yang sama). */
export async function getPglite(): Promise<PGlite> {
  const db = getPgliteSync();
  await db.waitReady;
  return db;
}
