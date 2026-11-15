import { PGlite } from '@electric-sql/pglite';
const dataDir = process.argv[2];
try {
  const db = new PGlite(dataDir);
  const t = await db.query('SELECT 1 as ok');
  console.log('PING OK:', JSON.stringify(t.rows));
  await db.close();
} catch (e: any) {
  console.error('MESSAGE:', e?.message);
  console.error('CAUSE:', e?.cause?.message ?? e?.cause);
}
