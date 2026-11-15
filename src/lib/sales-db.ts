/**
 * Sales Engine DB — tabel quote, lead, dan rekomendasi produk.
 * Semua definisi memakai drizzle pg-core di atas PGlite in-process
 * (instance yang sama dengan cms-db.ts lewat pglite-client).
 */
import { sql } from 'drizzle-orm';
import { boolean, doublePrecision, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { getPgliteSync } from '@/lib/pglite-client';

export const salesQuotes = pgTable('sales_quotes', {
  id: text('id').primaryKey(),
  sessionId: text('session_id'),
  customerName: text('customer_name'),
  companyName: text('company_name'),
  phone: text('phone'),
  email: text('email'),
  kota: text('kota'),
  status: text('status').notNull().default('draft'),
  totalEstimate: doublePrecision('total_estimate').notNull().default(0),
  needInstallation: boolean('need_installation').notNull().default(false),
  projectNote: text('project_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const quoteItems = pgTable('quote_items', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').notNull(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  productSlug: text('product_slug'),
  brand: text('brand'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: doublePrecision('unit_price').notNull().default(0),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const leadRequests = pgTable('lead_requests', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id'),
  name: text('name').notNull(),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  city: text('city'),
  needType: text('need_type'),
  description: text('description'),
  source: text('source').notNull().default('website'),
  status: text('status').notNull().default('baru'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const productMatches = pgTable('product_matches', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  criteriaHash: text('criteria_hash').notNull(),
  score: integer('score').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

export const recommendationHistory = pgTable('recommendation_history', {
  id: text('id').primaryKey(),
  sessionId: text('session_id'),
  productIds: text('product_ids').notNull().default('[]'),
  filtersJson: text('filters_json').notNull().default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
});

const globalForSales = globalThis as typeof globalThis & {
  __bmpSalesDrizzle?: ReturnType<typeof createSalesDrizzle>;
};

function createSalesDrizzle() {
  const pglite = getPgliteSync();
  return drizzle(pglite, { schema: { salesQuotes, quoteItems, leadRequests, productMatches, recommendationHistory } });
}

export function getSalesDb() {
  if (!globalForSales.__bmpSalesDrizzle) globalForSales.__bmpSalesDrizzle = createSalesDrizzle();
  return globalForSales.__bmpSalesDrizzle;
}

export type SalesQuote = typeof salesQuotes.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type LeadRequest = typeof leadRequests.$inferSelect;
