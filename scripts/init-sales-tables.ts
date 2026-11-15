/**
 * INISIALISASI TABEL SALES ENGINE (PGlite)
 * Membuat tabel untuk: AI product matcher, quote builder, dan lead requests.
 * Aman dijalankan berulang (IF NOT EXISTS).
 */
import { getPgliteSync } from '../src/lib/pglite-client';

async function main() {
  const db = getPgliteSync();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS product_matches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      criteria_hash TEXT NOT NULL,
      score INTEGER NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS product_matches_criteria_idx ON product_matches(criteria_hash);
    CREATE INDEX IF NOT EXISTS product_matches_product_idx ON product_matches(product_id);

    CREATE TABLE IF NOT EXISTS sales_quotes (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      customer_name TEXT,
      company_name TEXT,
      phone TEXT,
      email TEXT,
      kota TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      total_estimate DOUBLE PRECISION NOT NULL DEFAULT 0,
      need_installation BOOLEAN NOT NULL DEFAULT false,
      project_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS sales_quotes_session_idx ON sales_quotes(session_id);
    CREATE INDEX IF NOT EXISTS sales_quotes_status_idx ON sales_quotes(status);

    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL REFERENCES sales_quotes(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_slug TEXT,
      brand TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS quote_items_quote_idx ON quote_items(quote_id);

    CREATE TABLE IF NOT EXISTS lead_requests (
      id TEXT PRIMARY KEY,
      quote_id TEXT,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,
      city TEXT,
      need_type TEXT,
      description TEXT,
      source TEXT NOT NULL DEFAULT 'website',
      status TEXT NOT NULL DEFAULT 'baru',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS lead_requests_status_idx ON lead_requests(status);
    CREATE INDEX IF NOT EXISTS lead_requests_city_idx ON lead_requests(city);
    CREATE INDEX IF NOT EXISTS lead_requests_source_idx ON lead_requests(source);

    CREATE TABLE IF NOT EXISTS recommendation_history (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      product_ids TEXT NOT NULL DEFAULT '[]',
      filters_json TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS recommendation_history_session_idx ON recommendation_history(session_id);
  `);

  const { rows } = await db.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
  );
  console.log('Tabel sales engine siap. Daftar tabel publik:');
  for (const r of rows) console.log(' -', r.table_name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
