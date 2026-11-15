'use client';

/**
 * ProductQuoteButton — tombol "Tambah ke Quote" pada halaman detail produk.
 * Memasukkan produk ke quote store (localStorage) dan mengarahkan ke /quote.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Check, PlusCircle, ShoppingBag } from 'lucide-react';
import { useQuoteStore } from '@/stores/quote-store';

export function ProductQuoteButton({
  productId,
  name,
  slug,
  brand,
  price,
  image,
  category,
}: {
  productId: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  image: string | null;
  category: string;
}) {
  const addItem = useQuoteStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({
      productId,
      name,
      slug,
      brand: brand ?? undefined,
      price,
      image,
      category,
    });
    setAdded(true);
  }

  if (added) {
    return (
      <Link
        href="/quote"
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 font-semibold text-white transition hover:bg-teal-700"
      >
        <Check aria-hidden="true" className="size-5" /> Masuk quote — buka Quote Builder
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-teal-800 bg-white px-6 font-semibold text-teal-900 transition hover:bg-teal-50"
    >
      <PlusCircle aria-hidden="true" className="size-5" /> Tambah ke Quote
    </button>
  );
}
