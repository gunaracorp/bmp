/**
 * Inspeksi database PGlite BMP:
 * - total produk per brand
 * - daftar produk Bitzer + kelengkapan data (deskripsi, spesifikasi, gambar, harga)
 */
import { PGlite } from '@electric-sql/pglite';

const dataDir = process.argv[2] ?? '/home/z/my-project/db/pglite-data';

const db = new PGlite(dataDir);
try {
  const t = await db.query(`SELECT 1 as ok`);
  console.log('ping:', JSON.stringify(t.rows));
} catch (e) {
  console.error('PING GAGAL:', e);
  process.exit(1);
}

const brands = await db.query(`SELECT brand, COUNT(*) as n FROM products GROUP BY brand ORDER BY n DESC`);
console.log('=== PRODUK PER BRAND ===');
for (const b of brands.rows) console.log(`${String(b.brand).padEnd(14)} : ${b.n}`);

const bitzer = await db.query(`
  SELECT p.name, p.slug, p.price, p.brand, p.model, p.category_id,
         LENGTH(p.description) as desc_len, LENGTH(p.specifications) as spec_len,
         p.images, p.is_featured, p.in_stock
  FROM products p WHERE p.brand ILIKE '%bitzer%' ORDER BY p.name
`);
console.log(`\n=== PRODUK BITZER: ${bitzer.rows.length} item ===`);
for (const p of bitzer.rows) {
  console.log(`- ${p.name} | model=${p.model} | harga=${p.price} | desc=${p.desc_len}ch | spec=${p.spec_len}ch | img=${p.images ? p.images.slice(0, 60) : 'NULL'} | featured=${p.is_featured}`);
}

// contoh 3 produk lain untuk perbandingan kualitas data
const sample = await db.query(`SELECT name, brand, price, LENGTH(description) d, LENGTH(specifications) s, images FROM products WHERE brand ILIKE '%daikin%' LIMIT 3`);
console.log('\n=== SAMPEL DAIKIN (bandingkan) ===');
for (const p of sample.rows) console.log(`- ${p.name} | harga=${p.price} | desc=${p.d} | spec=${p.s} | img=${p.images?.slice(0,50)}`);

const cats = await db.query(`SELECT id, name, slug FROM categories ORDER BY sort_order`);
console.log('\n=== KATEGORI ===');
for (const c of cats.rows) console.log(`${c.id} | ${c.name} | ${c.slug}`);

const total = await db.query(`SELECT COUNT(*) as t FROM products`);
console.log(`\nTOTAL PRODUK: ${total.rows[0].t}`);

await db.close();
