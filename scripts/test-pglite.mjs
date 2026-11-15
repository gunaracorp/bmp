/**
 * Diagnostik PGlite — buka data dir dan tampilkan error sebenarnya.
 * Jalankan: node scripts/test-pglite.mjs [path-data-dir]
 */
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const dataDir = process.argv[2] || path.join(process.cwd(), 'db', 'pglite-data');
console.log('[test-pglite] Membuka data dir:', dataDir);

try {
  const db = new PGlite(dataDir);
  const t = setTimeout(() => {
    console.error('[test-pglite] TIMEOUT: inisialisasi tidak selesai dalam 30 detik');
    process.exit(2);
  }, 30000);
  await db.waitReady;
  clearTimeout(t);
  console.log('[test-pglite] waitReady OK');
  const res = await db.query('select version() as v');
  console.log('[test-pglite] version =', res.rows[0]?.v);
  const c = await db.query("select count(*)::int as n from categories");
  const p = await db.query("select count(*)::int as n from products");
  console.log('[test-pglite] categories =', c.rows[0]?.n, '| products =', p.rows[0]?.n);
  process.exit(0);
} catch (err) {
  console.error('[test-pglite] GAGAL:', err);
  if (err?.cause) console.error('[test-pglite] cause:', err.cause);
  process.exit(1);
}
