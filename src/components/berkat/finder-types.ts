/** Tipe bersama untuk hasil AI finder & perbandingan produk (client-safe). */
import { useCallback, useMemo, useSyncExternalStore } from 'react';

export type FinderResultItem = {
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

export type FinderResult = {
  criteria: {
    aplikasi: string;
    kapasitas: string;
    refrigeran: string;
    tipeSistem: string;
    budget: string;
    lokasi?: string;
  };
  items: FinderResultItem[];
  savedAt: number;
};

/** Daftar produk untuk halaman /compare (maksimal 4). */
export type CompareItem = FinderResultItem;

export const COMPARE_KEY = 'bmp-compare-list';
export const COMPARE_MAX = 4;

export function readCompareList(): CompareItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(COMPARE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CompareItem[]).slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

export function writeCompareList(items: CompareItem[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(COMPARE_KEY, JSON.stringify(items.slice(0, COMPARE_MAX)));
}

export function addToCompare(item: CompareItem): { ok: boolean; reason?: string } {
  const list = readCompareList();
  if (list.some((existing) => existing.productId === item.productId)) {
    return { ok: true };
  }
  if (list.length >= COMPARE_MAX) {
    return { ok: false, reason: `Maksimal ${COMPARE_MAX} produk untuk dibandingkan.` };
  }
  writeCompareList([...list, item]);
  return { ok: true };
}

export function removeFromCompare(productId: string) {
  writeCompareList(readCompareList().filter((item) => item.productId !== productId));
}

/* ── External store untuk compare list (React 18 useSyncExternalStore) ── */

const compareListeners = new Set<() => void>();

function notifyCompareListeners() {
  for (const listener of compareListeners) listener();
}

function subscribeCompare(listener: () => void): () => void {
  compareListeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    compareListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getCompareSnapshot(): string | null {
  return window.sessionStorage.getItem(COMPARE_KEY);
}

function getCompareServerSnapshot(): string | null {
  return null;
}

/** Hook React untuk membaca & memutasi daftar perbandingan produk. */
export function useCompareList() {
  const raw = useSyncExternalStore(subscribeCompare, getCompareSnapshot, getCompareServerSnapshot);
  const items = useMemo<CompareItem[]>(() => {
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CompareItem[]).slice(0, COMPARE_MAX) : [];
    } catch {
      return [];
    }
  }, [raw]);

  const add = useCallback((item: CompareItem): { ok: boolean; reason?: string } => {
    const list = readCompareList();
    if (list.some((existing) => existing.productId === item.productId)) {
      return { ok: true };
    }
    if (list.length >= COMPARE_MAX) {
      return { ok: false, reason: `Maksimal ${COMPARE_MAX} produk untuk dibandingkan.` };
    }
    writeCompareList([...list, item]);
    notifyCompareListeners();
    return { ok: true };
  }, []);

  const remove = useCallback((productId: string) => {
    removeFromCompare(productId);
    notifyCompareListeners();
  }, []);

  const clear = useCallback(() => {
    writeCompareList([]);
    notifyCompareListeners();
  }, []);

  return { items, add, remove, clear };
}
