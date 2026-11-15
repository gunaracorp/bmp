import { drizzle } from 'drizzle-orm/pglite';
import { pgTable, text, doublePrecision } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { getPgliteSync } from '../src/lib/pglite-client';

const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
});

async function main() {
  console.log('1. ambil instance pglite...');
  const pglite = getPgliteSync();
  console.log('2. instance OK, test raw query...');
  const t = setTimeout(() => { console.log('TIMEOUT raw query!'); process.exit(2); }, 15000);
  const r = await pglite.query<{ c: number }>('SELECT COUNT(*)::int AS c FROM products');
  clearTimeout(t);
  console.log('3. raw OK:', r.rows[0]);

  const db = drizzle(pglite);
  console.log('4. drizzle query...');
  const t2 = setTimeout(() => { console.log('TIMEOUT drizzle query!'); process.exit(3); }, 15000);
  const rows = await db.select({ id: products.id, name: products.name }).from(products).limit(3);
  clearTimeout(t2);
  console.log('5. drizzle OK:', rows.map((r) => r.name));

  const t3 = setTimeout(() => { console.log('TIMEOUT raw sql via drizzle!'); process.exit(4); }, 15000);
  const [cnt] = await db.select({ c: sql<number>`count(*)::int` }).from(products);
  clearTimeout(t3);
  console.log('6. count OK:', cnt);
  process.exit(0);
}

main().catch((e) => { console.error('ERR:', e); process.exit(1); });
