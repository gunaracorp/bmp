/**
 * UJI TULIS MODE REMOTE: bukti INSERT via drizzle benar-benar tersimpan
 * di database DATABASE_URL (simulasi Neon) dan bisa dibaca kembali.
 *
 * Pakai: DATABASE_URL="postgres://..." bun run scripts/test-remote-write.ts
 */
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { getSalesDb, leadRequests } from '../src/lib/sales-db';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL wajib di-set');
    process.exit(1);
  }
  const id = `test-remote-write-${Date.now()}`;

  // 1) Tulis via drizzle (jalur yang sama dipakai aplikasi)
  const db = getSalesDb();
  await db.insert(leadRequests).values({
    id,
    name: 'Uji Tulis Remote BMP',
    company: 'PT Pengujian Driver',
    city: 'Bekasi',
    needType: 'Uji integrasi',
    source: 'uji-teknis',
    status: 'baru',
  });
  console.log(`✍️  INSERT ok: ${id}`);

  // 2) Baca balik via drizzle
  const back = await db.select().from(leadRequests).where(eq(leadRequests.id, id));
  if (back.length !== 1) throw new Error('Baris tidak ditemukan saat dibaca balik via drizzle!');
  console.log(`📖 READ via drizzle ok: ${back[0].name} / ${back[0].city}`);

  // 3) Verifikasi INDEPENDEN lewat pg Pool murni (bukan jalur aplikasi)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query('SELECT name, city, status FROM lead_requests WHERE id = $1', [id]);
  await pool.query('DELETE FROM lead_requests WHERE id = $1', [id]);
  await pool.end();
  if (rows.length !== 1) throw new Error('Baris tidak terlihat oleh pg Pool murni!');
  console.log(`🔎 VERIFY via pg murni ok: ${rows[0].name} — lalu dihapus (uji bersih)`);
  console.log('🎉 MODE REMOTE PERSISTEN TERBUKTI: tulis-baca-hapus di DATABASE_URL sukses.');
}

main().catch((err) => {
  console.error('❌ Uji tulis remote gagal:', err);
  process.exit(1);
});
