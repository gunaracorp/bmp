/**
 * INISIALISASI SKEMA NEON/POSTGRES REMOTE
 * Membuat seluruh tabel website Berkat Mandiri Pendingin di database remote.
 * Identik dengan skema PGlite (init-pglite-schema.ts + init-sales-tables.ts).
 * Aman dijalankan berulang (IF NOT EXISTS).
 *
 * Pakai: DATABASE_URL="postgres://..." bun run scripts/init-neon-schema.ts
 */
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL wajib di-set (connection string Neon/Postgres).');
  process.exit(1);
}

const ssl = /sslmode=/.test(DATABASE_URL)
  ? undefined
  : /(neon\.tech|supabase\.(co|com)|amazonaws\.com|render\.com)/.test(DATABASE_URL)
    ? { rejectUnauthorized: false }
    : undefined;

const pool = new Pool({ connectionString: DATABASE_URL, ssl });

const DDL = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_desc TEXT,
    price DOUBLE PRECISION NOT NULL,
    original_price DOUBLE PRECISION,
    category_id TEXT NOT NULL REFERENCES categories(id),
    brand TEXT,
    model TEXT,
    specifications TEXT,
    images TEXT,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    min_order INTEGER NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'unit',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
  CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
  CREATE INDEX IF NOT EXISTS products_featured_idx ON products(is_featured);

  CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    position TEXT,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL,
    avatar TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS cms_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    status TEXT NOT NULL,
    author_name TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    status TEXT NOT NULL,
    author_name TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS cms_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS product_image_assets (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    source_file_id TEXT NOT NULL,
    source_path TEXT NOT NULL,
    source_path_lower TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    revision TEXT,
    provider_content_hash TEXT,
    source_modified_at TIMESTAMPTZ,
    rights_status TEXT NOT NULL,
    rights_basis TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    source_deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_status TEXT NOT NULL DEFAULT 'DISCOVERED',
    image_sha256 TEXT,
    perceptual_hash TEXT,
    width INTEGER,
    height INTEGER,
    storage_path TEXT,
    product_id TEXT,
    processing_error TEXT,
    processed_at TIMESTAMPTZ,
    quality_score DOUBLE PRECISION,
    watermark_status TEXT NOT NULL DEFAULT 'NOT_APPLIED',
    watermark_version TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS product_image_assets_owner_source_unique
    ON product_image_assets(owner_user_id, source_file_id);

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
`;

async function main() {
  const host = new URL(DATABASE_URL!).host;
  console.log(`🔌 Menyambung ke database remote: ${host}`);
  await pool.query(DDL);
  const { rows } = await pool.query<{ table_name: string }>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name",
  );
  console.log(`✅ Skema Neon siap (${rows.length} tabel): ${rows.map((r) => r.table_name).join(', ')}`);
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Gagal inisialisasi skema Neon:', err.message);
  process.exit(1);
});
