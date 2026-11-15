/**
 * PRODUCT MATCHER — mesin skor kecocokan produk HVAC (B2B).
 *
 * Bobot skor mengikuti blueprint BMP:
 *   40% aplikasi · 25% kapasitas · 20% refrigeran · 10% brand · 5% harga.
 *
 * Berjalan di server (mengakses cmsDb). Data spesifikasi produk tersimpan
 * sebagai JSON di kolom `specifications` dengan kunci: kompresor_type,
 * refrigerant, kapasitas, aplikasi, dst.
 */
import { and, eq, inArray } from 'drizzle-orm';
import { categories, cmsDb, products } from '@/lib/cms-db';
import {
  APLIKASI_OPTIONS,
  REFRIGERAN_OPTIONS,
  TIPE_SISTEM_OPTIONS,
} from '@/lib/finder-options';

export const KOMPRESOR_CATEGORY_SLUGS = [
  'kompresor-rotary',
  'kompresor-twin-rotary',
  'kompresor-dc-inverter',
  'kompresor-scroll',
  'kompresor-scroll-komersial',
  'kompresor-piston-hermetik',
  'kompresor-semi-hermetik',
  'kompresor-screw',
  'unit-kondensor-kompak',
  'kompresor',
] as const;

export const KAPASITAS_CHOICES = [
  { value: '1', label: '±1 HP' },
  { value: '2', label: '±2 HP' },
  { value: '3', label: '±3 HP' },
  { value: '5', label: '±5 HP' },
  { value: '10', label: '±10 HP' },
  { value: '20', label: '±20 HP' },
  { value: '50', label: '±50 HP' },
  { value: '100', label: '100+ HP' },
] as const;

export const BUDGET_CHOICES = [
  { value: 'low', label: 'Ekonomis' },
  { value: 'mid', label: 'Kelas menengah' },
  { value: 'premium', label: 'Premium / Proyek besar' },
] as const;

export type FinderCriteria = {
  aplikasi: string;
  kapasitas: string; // angka HP dalam bentuk string
  refrigeran: string;
  tipeSistem: string;
  budget: string;
  lokasi?: string;
};

export type MatchedProduct = {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  categorySlug: string;
  category: string;
  price: number;
  priceEstimate: string;
  image: string | null;
  inStock: boolean;
  compatibilityScore: number;
  reason: string;
  badges: string[];
  specs: {
    refrigerant?: string;
    kapasitasHp: number;
    kompresorType?: string;
    tegangan?: string;
    aplikasi?: string;
  };
};

export function isValidCriteria(value: unknown): value is FinderCriteria {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.aplikasi === 'string' && APLIKASI_OPTIONS.some((o) => o.value === v.aplikasi) &&
    typeof v.kapasitas === 'string' && Number.isFinite(Number(v.kapasitas)) && Number(v.kapasitas) > 0 &&
    typeof v.refrigeran === 'string' &&
    typeof v.tipeSistem === 'string' &&
    typeof v.budget === 'string'
  );
}

export function normalizeCriteria(value: FinderCriteria): FinderCriteria {
  return {
    aplikasi: value.aplikasi.trim().toLowerCase(),
    kapasitas: String(Number(value.kapasitas)),
    refrigeran: value.refrigeran.trim().toUpperCase(),
    tipeSistem: value.tipeSistem.trim().toLowerCase(),
    budget: value.budget.trim().toLowerCase(),
    lokasi: value.lokasi?.trim().slice(0, 80) || undefined,
  };
}

export function criteriaHash(criteria: FinderCriteria): string {
  const raw = JSON.stringify([criteria.aplikasi, criteria.kapasitas, criteria.refrigeran, criteria.tipeSistem, criteria.budget]);
  // FNV-1a 32-bit — cukup untuk kriteria pencocokan, bukan keamanan.
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

type ParsedProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  inStock: boolean;
  isFeatured: boolean;
  viewCount: number;
  image: string | null;
  categorySlug: string;
  categoryName: string;
  refrigerant: string;
  kapasitasHp: number;
  kompresorType: string;
  tegangan: string;
  aplikasiText: string;
};

function parseHp(...sources: (string | null | undefined)[]): number {
  for (const source of sources) {
    if (!source) continue;
    const match = source.match(/([\d]+(?:[.,][\d]+)?)\s*(?:hp|pk)\b/i);
    if (match) {
      const value = Number(match[1].replace(',', '.'));
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return 0;
}

function parseProduct(
  row: {
    id: string; name: string; slug: string; brand: string | null; price: number;
    inStock: boolean; isFeatured: boolean; viewCount: number; images: string | null;
    specifications: string | null; categorySlug: string; categoryName: string;
  },
): ParsedProduct {
  let specs: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(row.specifications ?? '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) specs = parsed as Record<string, string>;
  } catch {
    specs = {};
  }

  // Refrigeran: prioritas spesifikasi JSON, lalu akhiran slug (-r404a).
  let refrigerant = (specs.refrigerant ?? '').trim();
  if (!refrigerant) {
    const slugMatch = row.slug.match(/-r([\w]+)$/i);
    if (slugMatch) {
      const candidate = `R${slugMatch[1].toUpperCase()}`;
      const canonical = REFRIGERAN_OPTIONS.find((r) => r.toUpperCase() === candidate);
      refrigerant = canonical ?? candidate;
    }
  }

  const kapasitasHp = parseHp(specs.kapasitas, specs.kapasitas_pk, row.name);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand ?? 'Lainnya',
    price: row.price,
    inStock: row.inStock,
    isFeatured: row.isFeatured,
    viewCount: row.viewCount,
    image: row.images || null,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    refrigerant: refrigerant.toUpperCase(),
    kapasitasHp,
    kompresorType: specs.kompresor_type ?? row.categoryName,
    tegangan: specs.tegangan ?? '',
    aplikasiText: specs.aplikasi ?? '',
  };
}

const PREMIUM_BRANDS = new Set(['Bitzer', 'Copeland', 'Danfoss', 'Carrier', 'Trane', 'Daikin', 'Tecumseh', 'Maneurop']);

/** Metadata scoring per aplikasi — kategori cocok, refrigeran kompatibel, rentang HP wajar. */
const APLIKASI_SCORING: Record<string, { categorySlugs: string[]; refrigerants: string[]; minHp: number; maxHp: number }> = {
  'cold-room': { categorySlugs: ['kompresor-semi-hermetik', 'kompresor-scroll-komersial', 'kompresor-piston-hermetik', 'kompresor-scroll', 'unit-kondensor-kompak'], refrigerants: ['R404A', 'R507', 'R134A', 'R22', 'R407C', 'R290'], minHp: 2, maxHp: 60 },
  freezer: { categorySlugs: ['kompresor-semi-hermetik', 'kompresor-piston-hermetik', 'kompresor-screw', 'unit-kondensor-kompak'], refrigerants: ['R404A', 'R507', 'R22', 'R290'], minHp: 2, maxHp: 100 },
  supermarket: { categorySlugs: ['kompresor-semi-hermetik', 'kompresor-screw', 'kompresor-scroll-komersial', 'unit-kondensor-kompak'], refrigerants: ['R404A', 'R507', 'R134A', 'R407C'], minHp: 5, maxHp: 100 },
  chiller: { categorySlugs: ['kompresor-screw', 'kompresor-scroll-komersial', 'kompresor-semi-hermetik'], refrigerants: ['R134A', 'R507', 'R407C', 'R410A'], minHp: 15, maxHp: 220 },
  'office-ac': { categorySlugs: ['kompresor-rotary', 'kompresor-twin-rotary', 'kompresor-dc-inverter', 'kompresor-scroll'], refrigerants: ['R32', 'R410A', 'R22', 'R407C'], minHp: 0.5, maxHp: 20 },
  'industrial-plant': { categorySlugs: ['kompresor-screw', 'kompresor-semi-hermetik'], refrigerants: ['R134A', 'R404A', 'R507', 'R717', 'R407C'], minHp: 20, maxHp: 220 },
};

/** Skor aplikasi (0–40): kategori produk harus masuk daftar kategori aplikasi. */
function applicationScore(product: ParsedProduct, option: (typeof APLIKASI_OPTIONS)[number]): number {
  const meta = APLIKASI_SCORING[option.value] ?? { categorySlugs: [], refrigerants: [], minHp: 1, maxHp: 220 };
  const direct = meta.categorySlugs.includes(product.categorySlug);
  const kompresorGeneric = product.categorySlug === 'kompresor' ? 0.5 : 0;
  if (!direct && kompresorGeneric === 0) {
    // Kategori tidak relevan — masih ada kemungkinan via field aplikasi teks.
    const label = option.label.split(' ')[0]?.toLowerCase() ?? '';
    if (label && product.aplikasiText.toLowerCase().includes(label)) return 22;
    return 0;
  }
  const base = direct ? 34 : 20;
  // Bonus kecil bila teks aplikasi pada spesifikasi menyebut aplikasi serupa.
  const textMention = product.aplikasiText.length > 0 ? 6 : 0;
  return Math.min(40, base + textMention + kompresorGeneric * 8);
}

/** Skor kapasitas (0–25): jarak logaritmik terhadap target HP. */
function capacityScore(product: ParsedProduct, targetHp: number, option: (typeof APLIKASI_OPTIONS)[number]): number {
  if (product.kapasitasHp <= 0) return 4; // data kapasitas tidak tersedia
  if (targetHp >= 100 && product.kapasitasHp >= 100) return 25;
  const ratio = Math.log(product.kapasitasHp / targetHp);
  const distance = Math.abs(ratio);
  let score: number;
  if (distance <= 0.15) score = 25;       // hampir persis
  else if (distance <= 0.35) score = 21;  // dekat (−29% .. +42%)
  else if (distance <= 0.7) score = 14;
  else if (distance <= 1.2) score = 7;
  else score = 2;
  // Penalti bila di luar rentang wajar aplikasi.
  const meta = APLIKASI_SCORING[option.value];
  if (meta && (product.kapasitasHp < meta.minHp * 0.5 || product.kapasitasHp > meta.maxHp * 1.5)) score = Math.min(score, 6);
  return score;
}

/** Skor refrigeran (0–20). */
function refrigerantScore(product: ParsedProduct, criteria: FinderCriteria, option: (typeof APLIKASI_OPTIONS)[number]): number {
  if (!product.refrigerant) return 6;
  if (product.refrigerant === criteria.refrigeran) return 20;
  const compatible = APLIKASI_SCORING[option.value]?.refrigerants ?? [];
  if (compatible.includes(product.refrigerant)) return 11; // kompatibel untuk aplikasi
  return 3;
}

/** Skor brand (0–10). */
function brandScore(product: ParsedProduct): number {
  if (PREMIUM_BRANDS.has(product.brand)) return 10;
  if (product.isFeatured) return 8;
  return 6;
}

/** Skor harga (0–5) sesuai preferensi budget dalam kohort kandidat. */
function budgetScore(product: ParsedProduct, sorted: number[], criteria: FinderCriteria): number {
  if (sorted.length === 0) return 3;
  const rank = sorted.indexOf(product.price);
  if (rank < 0) return 3;
  const percentile = rank / Math.max(1, sorted.length - 1); // 0 = termurah
  if (criteria.budget === 'low') return Math.round(5 * (1 - percentile) * 2) / 2;
  if (criteria.budget === 'premium') return Math.round(5 * percentile * 2) / 2;
  // mid — paling bagus di tengah distribusi
  return Math.round(5 * (1 - Math.abs(percentile - 0.5) * 2) * 2) / 2;
}

function buildReasons(product: ParsedProduct, criteria: FinderCriteria, option: (typeof APLIKASI_OPTIONS)[number], appScore: number, capScore: number, refScore: number): string {
  const parts: string[] = [];
  if (appScore >= 30) parts.push(`Kategori ${product.categoryName} sangat cocok untuk ${option.label.toLowerCase()}`);
  else if (appScore >= 18) parts.push(`Kategori ${product.categoryName} relevan untuk ${option.label.toLowerCase()}`);
  else parts.push(`Alternatif lintas kategori untuk ${option.label.toLowerCase()}`);

  if (product.kapasitasHp > 0) {
    const target = Number(criteria.kapasitas);
    const ratio = product.kapasitasHp / target;
    if (ratio >= 0.87 && ratio <= 1.15) parts.push(`Kapasitas ${product.kapasitasHp} HP tepat mendekati kebutuhan ±${target} HP`);
    else if (ratio < 0.87) parts.push(`Kapasitas ${product.kapasitasHp} HP — opsi hemat untuk kebutuhan ±${target} HP`);
    else parts.push(`Kapasitas ${product.kapasitasHp} HP — headroom aman untuk kebutuhan ±${target} HP`);
  }
  if (refScore === 20) parts.push(`Refrigeran ${product.refrigerant} persis sesuai kebutuhan`);
  else if (refScore >= 11) parts.push(`Refrigeran ${product.refrigerant} kompatibel untuk aplikasi ini`);
  return parts.join(' · ');
}

function buildBadges(product: ParsedProduct, index: number, option: (typeof APLIKASI_OPTIONS)[number]): string[] {
  const badges: string[] = [];
  if (index === 0) badges.push('Paling cocok');
  else if (index <= 2) badges.push('Alternatif');
  if (product.kapasitasHp >= 50 || product.categorySlug === 'kompresor-screw') badges.push('Cocok untuk proyek besar');
  if (product.inStock && product.viewCount >= 25) badges.push('Banyak dipakai proyek serupa');
  const meta = APLIKASI_SCORING[option.value];
  if (meta && meta.minHp >= 15 && product.kapasitasHp >= meta.minHp) badges.push('Kelas industri');
  return badges.slice(0, 3);
}

export async function findMatchingProducts(criteria: FinderCriteria, limit = 5): Promise<MatchedProduct[]> {
  const normalized = normalizeCriteria(criteria);
  const option = APLIKASI_OPTIONS.find((o) => o.value === normalized.aplikasi) ?? APLIKASI_OPTIONS[0];
  const targetHp = Number(normalized.kapasitas);

  const meta = APLIKASI_SCORING[normalized.aplikasi];
  const candidateSlugs = new Set<string>([...(meta?.categorySlugs ?? []), 'kompresor']);
  // Tipe sistem eksplisit dari user selalu ikut kandidat.
  const systemOption = TIPE_SISTEM_OPTIONS.find((t) => t.value === normalized.tipeSistem);
  if (systemOption) candidateSlugs.add(systemOption.categorySlug);

  const rows = await cmsQueryCandidates([...candidateSlugs]);
  const parsed = rows.map(parseProduct).filter((p) => p.kapasitasHp > 0 && p.inStock);

  if (parsed.length === 0) return [];

  const sortedPrices = [...parsed].map((p) => p.price).sort((a, b) => a - b);

  const scored = parsed.map((product) => {
    const app = applicationScore(product, option);
    const cap = capacityScore(product, targetHp, option);
    const ref = refrigerantScore(product, normalized, option);
    const brand = brandScore(product);
    const budget = budgetScore(product, sortedPrices, normalized);
    // Bobot sesuai blueprint: 40/25/20/10/5
    const total = Math.round(app * 0.4 + cap * 0.25 + ref * 0.2 + brand * 0.1 + budget * 0.05);
    return { product, total, app, cap, ref };
  });

  scored.sort((a, b) => b.total - a.total || a.product.price - b.product.price);

  const seen = new Set<string>();
  const results: MatchedProduct[] = [];
  for (const entry of scored) {
    if (results.length >= limit) break;
    // Deduplikasi: satu produk per brand+kapasitas mirip agar rekomendasi beragam.
    const key = `${entry.product.brand}-${Math.round(entry.product.kapasitasHp)}`;
    if (seen.has(key) && results.length < limit - 1 && scored.length > limit) continue;
    seen.add(key);
    results.push({
      productId: entry.product.id,
      name: entry.product.name,
      slug: entry.product.slug,
      brand: entry.product.brand,
      categorySlug: entry.product.categorySlug,
      category: entry.product.categoryName,
      price: entry.product.price,
      priceEstimate: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(entry.product.price),
      image: entry.product.image,
      inStock: entry.product.inStock,
      compatibilityScore: entry.total,
      reason: buildReasons(entry.product, normalized, option, entry.app, entry.cap, entry.ref),
      badges: buildBadges(entry.product, results.length, option),
      specs: {
        refrigerant: entry.product.refrigerant,
        kapasitasHp: entry.product.kapasitasHp,
        kompresorType: entry.product.kompresorType,
        tegangan: entry.product.tegangan,
        aplikasi: entry.product.aplikasiText,
      },
    });
  }
  return results;
}

/** Ambil produk kandidat (in-stock, kategori kompresor tertentu). */
function cmsQueryCandidates(categorySlugs: string[]) {
  return cmsDb
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      price: products.price,
      inStock: products.inStock,
      isFeatured: products.isFeatured,
      viewCount: products.viewCount,
      images: products.images,
      specifications: products.specifications,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.inStock, true), inArray(categories.slug, categorySlugs)))
    .limit(600);
}

export function criteriaSummaryLabel(criteria: FinderCriteria): string {
  const app = APLIKASI_OPTIONS.find((o) => o.value === criteria.aplikasi)?.label ?? criteria.aplikasi;
  const sys = TIPE_SISTEM_OPTIONS.find((t) => t.value === criteria.tipeSistem)?.label ?? criteria.tipeSistem;
  return `${app} · ±${criteria.kapasitas} HP · ${criteria.refrigeran} · ${sys}`;
}
