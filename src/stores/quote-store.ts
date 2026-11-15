import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteCartItem {
  productId: string;
  name: string;
  slug?: string;
  brand?: string;
  price: number;
  image?: string | null;
  category?: string;
  quantity: number;
  note?: string;
}

interface QuoteState {
  items: QuoteCartItem[];
  needInstallation: boolean;
  customerName: string;
  companyName: string;
  city: string;
  phone: string;
  email: string;
  projectNote: string;
  addItem: (item: Omit<QuoteCartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setNote: (productId: string, note: string) => void;
  clearQuote: () => void;
  setNeedInstallation: (value: boolean) => void;
  setCustomer: (patch: Partial<Pick<QuoteState, 'customerName' | 'companyName' | 'city' | 'phone' | 'email' | 'projectNote'>>) => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      items: [],
      needInstallation: false,
      customerName: '',
      companyName: '',
      city: '',
      phone: '',
      email: '',
      projectNote: '',
      addItem: (item, quantity = 1) => {
        const items = [...get().items];
        const existingIndex = items.findIndex((i) => i.productId === item.productId);
        if (existingIndex > -1) {
          items[existingIndex].quantity = Math.min(999, items[existingIndex].quantity + quantity);
          set({ items });
        } else {
          set({
            items: [...items, { ...item, quantity: Math.min(999, Math.max(1, quantity)) }],
          });
        }
      },
      removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(999, quantity) } : i)),
        })),
      setNote: (productId, note) =>
        set((state) => ({ items: state.items.map((i) => (i.productId === productId ? { ...i, note } : i)) })),
      clearQuote: () => set({ items: [], needInstallation: false }),
      setNeedInstallation: (value) => set({ needInstallation: value }),
      setCustomer: (patch) => set(patch),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'berkat-quote' },
  ),
);
