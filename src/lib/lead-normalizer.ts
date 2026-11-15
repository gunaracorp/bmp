/**
 * Lead normalizer — pembersihan & validasi data lead sebelum disimpan.
 * Semua endpoint (POST /api/leads, POST /api/quotes) memakai modul ini
 * agar data sales yang masuk konsisten.
 */

export type NormalizedLead = {
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  needType: string | null;
  description: string | null;
};

export type NormalizeResult =
  | { ok: true; data: NormalizedLead }
  | { ok: false; errors: string[] };

const NEED_TYPE_VALUES = [
  'cold-room', 'freezer', 'supermarket', 'chiller', 'office-ac',
  'industrial-plant', 'spare-part', 'refrigerant', 'lainnya',
] as const;

function cleanText(value: unknown, max = 160): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/\s+/g, ' ').trim().slice(0, max);
  return cleaned.length > 0 ? cleaned : null;
}

/** Normalisasi nomor Indonesia: 08123… → 628123… (tanpa karakter non-digit). */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 16) return null;
  let normalized = digits;
  if (normalized.startsWith('62')) {
    // sudah awalan 62
  } else if (normalized.startsWith('0')) {
    normalized = `62${normalized.slice(1)}`;
  } else if (normalized.startsWith('8')) {
    normalized = `62${normalized}`;
  } else {
    return null;
  }
  return normalized;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  return email.length >= 5 && email.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isKnownNeedType(value: unknown): boolean {
  return typeof value === 'string' && (NEED_TYPE_VALUES as readonly string[]).includes(value);
}

export function normalizeLead(input: unknown): NormalizeResult {
  const errors: string[] = [];
  const raw = (input ?? {}) as Record<string, unknown>;

  const name = cleanText(raw.name, 100);
  if (!name) errors.push('Nama wajib diisi.');

  const company = cleanText(raw.company, 120);
  const phoneRaw = cleanText(raw.phone, 24);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  const emailRaw = typeof raw.email === 'string' ? raw.email.trim() : null;
  const email = emailRaw ? emailRaw.toLowerCase() : null;

  if (phoneRaw && !phone) errors.push('Nomor telepon/WhatsApp tidak valid (contoh: 081234567890).');
  if (emailRaw && !isValidEmail(email)) errors.push('Format email tidak valid.');

  const city = cleanText(raw.city, 80);
  let needType = cleanText(raw.needType, 40)?.toLowerCase() ?? null;
  if (needType && !isKnownNeedType(needType)) needType = 'lainnya';
  const description = cleanText(raw.description, 1000);

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: { name: name!, company, phone, email, city, needType, description },
  };
}

export const LEAD_STATUS_FLOW = ['baru', 'dibalas', 'dikonfirmasi', 'quote_dibuat', 'closed_won', 'closed_lost'] as const;
export type LeadStatus = (typeof LEAD_STATUS_FLOW)[number];

export function isValidLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUS_FLOW as readonly string[]).includes(value);
}
