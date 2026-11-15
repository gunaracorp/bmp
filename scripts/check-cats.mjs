/**
 * Diagnostik cepat: daftar kategori kompresor + jumlah produk per kategori.
 * Jalankan: node scripts/check-cats.mjs
 */
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite(path.join(process.cwd(), 'db', 'pglite-data'));
await db.waitReady;
const rows = await db.query(
  "select c.slug, c.name, count(p.id)::int as n from categories c left join products p on p.category_id = c.id where c.slug like 'kompresor%' or c.slug like 'unit%' group by c.id order by c.sort_order",
);
console.log(JSON.stringify(rows.rows, null, 1));
process.exit(0);
