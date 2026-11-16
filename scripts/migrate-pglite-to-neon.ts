/**
 * MIGRASI DATA PENUH: PGlite lokal → Neon/Postgres remote.
 *
 * Menyalin SELURUH isi tabel (kategori, 614 produk, testimoni, artikel CMS,
 * gambar aset, quote/lead) dari snapshot PGlite ke DATABASE_URL — idempoten
 * (ON CONFLICT DO NOTHING, aman dijalankan berulang).
 *
 * Pakai:
 *   DATABASE_URL="postgres://..." bun run scripts/migrate-pglite-to-neon.ts
 * Env opsional:
 *   SOURCE_DIR=/tmp/migrate-source   (default: db/pglite-data)
 *   BATCH_ROWS=50                    (ukuran batch insert)
 *
 * Prasyarat aman: server dev dihentikan dulu (pkill next) lalu snapshot
 * disalin ke SOURCE_DIR — snapshot hidup tidak boleh dibaca dua instance.
 */
import path from 'node:path';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL wajib di-set (connection string Neon/Postgres).');
  process.exit(1);
}

const SOURCE_DIR = process.env.SOURCE_DIR ?? path.join(process.cwd(), 'db', 'pglite-data');
const BATCH_ROWS = Number(process.env.BATCH_ROWS ?? 50);

/** Urutan tabel — FK-dependent belakangan (quote_items setelah sales_quotes). */
const TABLES = [
  'categories',
  'products',
  'testimonials',
  'cms_articles',
  'articles',
  'cms_settings',
  'site_settings',
  'product_image_assets',
  'sales_quotes',
  'quote_items',
  'lead_requests',
  'product_matches',
  'recommendation_history',
] as const;

function sanitize<T extends Record<string, unknown>>(row: T): T {
  // Postgres menolak karakter NUL di TEXT — bersihkan proaktif.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = typeof v === 'string' ? v.replace(/\0/g, '') : v;
  }
  return out as T;
}

const ssl = /sslmode=/.test(DATABASE_URL)
  ? undefined
  : /(neon\.tech|supabase\.(co|com)|amazonaws\.com|render\.com)/.test(DATABASE_URL)
    ? { rejectUnauthorized: false }
    : undefined;

const target = new Pool({ connectionString: DATABASE_URL, ssl });

async function main() {
  if (!fs.existsSync(path.join(SOURCE_DIR, 'PG_VERSION'))) {
    console.error(`❌ Snapshot sumber tidak ditemukan di ${SOURCE_DIR}`);
    process.exit(1);
  }
  console.log(`📡 Sumber : ${SOURCE_DIR}`);
  console.log(`🎯 Target : ${new URL(DATABASE_URL).host}`);

  const src = new PGlite(SOURCE_DIR);
  await src.waitReady;
  console.log('✅ PGlite sumber terbuka');

  // 0) Skema target dijamin ada (dibuat oleh init-neon-schema.ts)
  const { rows: tblCheck } = await target.query<{ exists: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products') AS exists",
  );
  if (!tblCheck[0]?.exists) {
    console.error('❌ Tabel belum ada di target — jalankan dulu: bun run scripts/init-neon-schema.ts');
    process.exit(1);
  }

  let grandSource = 0;
  let grandTarget = 0;

  for (const table of TABLES) {
    // Kolom dari sumber (urutan ordinal)
    const { rows: colRows } = await src.query<{ column_name: string }>(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
      [table],
    );
    if (colRows.length === 0) {
      console.log(`⏭  ${table}: tidak ada di sumber — dilewati`);
      continue;
    }
    const cols = colRows.map((r) => r.column_name);
    const colList = cols.map((c) => `"${c}"`).join(', ');

    const { rows } = await src.query<Record<string, unknown>>(`SELECT * FROM "${table}"`);
    grandSource += rows.length;

    let inserted = 0;
    for (let i = 0; i < rows.length; i += BATCH_ROWS) {
      const chunk = rows.slice(i, i + BATCH_ROWS).map(sanitize);
      if (chunk.length === 0) continue;
      const values: unknown[] = [];
      const tuples = chunk.map((row) => {
        const ph = cols.map((c) => {
          values.push(row[c]);
          return `$${values.length}`;
        });
        return `(${ph.join(', ')})`;
      });
      await target.query(
        `INSERT INTO "${table}" (${colList}) VALUES ${tuples.join(', ')} ON CONFLICT DO NOTHING`,
        values,
      );
      inserted += chunk.length;
    }

    const { rows: cntRows } = await target.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "${table}"`);
    const targetCount = Number(cntRows[0]?.count ?? 0);
    grandTarget += targetCount;

    const mark = targetCount >= rows.length ? '✅' : '⚠️ ';
    console.log(`${mark} ${table}: sumber=${rows.length} → target=${targetCount} (batch ${inserted})`);
  }

  console.log('──────────────────────────────────────');
  console.log(`TOTAL baris: sumber=${grandSource}, target=${grandTarget}`);
  if (grandTarget >= grandSource) {
    console.log('🎉 MIGRASI SELESAI — data aman tersimpan permanen di Neon.');
  } else {
    console.error('⚠️  Ada baris yang belum masuk — periksa log di atas.');
    process.exitCode = 1;
  }

  await src.close();
  await target.end();
}

main().catch((err) => {
  console.error('❌ Migrasi gagal:', err);
  process.exit(1);
});
