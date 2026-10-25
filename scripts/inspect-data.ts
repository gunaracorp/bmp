/**
 * Inspeksi data PGlite: struktur spesifikasi produk, kategori, brand.
 * Untuk merancang product matcher.
 */
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');

async function main() {
  const db = new PGlite(dataDir);

  const { rows: cats } = await db.query<{ slug: string; name: string }>(
    `SELECT slug, name FROM categories ORDER BY sort_order`,
  );
  console.log('=== KATEGORI (%d) ===', cats.length);
  for (const c of cats) console.log(` - ${c.slug} :: ${c.name}`);

  const { rows: brandRows } = await db.query<{ brand: string; n: number }>(
    `SELECT brand, COUNT(*)::int AS n FROM products WHERE brand IS NOT NULL GROUP BY brand ORDER BY n DESC`,
  );
  console.log('\n=== BRAND (%d) ===', brandRows.length);
  for (const b of brandRows) console.log(` - ${b.brand}: ${b.n}`);

  const { rows: sample } = await db.query<{ name: string; slug: string; specifications: string | null; price: number; category_slug: string }>(
    `SELECT p.name, p.slug, p.specifications, p.price, c.slug AS category_slug
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE c.slug LIKE 'kompresor-%'
     ORDER BY p.price LIMIT 3`,
  );
  console.log('\n=== SAMPLE PRODUK KOMPRESOR ===');
  for (const s of sample) {
    console.log(`\n# ${s.name} (${s.category_slug}) Rp${s.price}`);
    console.log(s.specifications?.slice(0, 600));
  }

  // distribusi hp dari slug
  const { rows: hpRows } = await db.query<{ slug: string }>(
    `SELECT slug FROM products WHERE slug LIKE '%hp%' LIMIT 5`,
  );
  console.log('\n=== SAMPLE SLUG ===');
  for (const r of hpRows) console.log(` - ${r.slug}`);

  // test begin/commit raw
  try {
    await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const { rows } = await db.query<{ c: number }>('SELECT COUNT(*)::int AS c FROM products');
    await db.query('COMMIT');
    console.log('\n=== RAW BEGIN/COMMIT OK, total produk:', rows[0]?.c);
  } catch (err) {
    console.log('\n=== RAW BEGIN/COMMIT GAGAL:', (err as Error).message);
  }

  await db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
