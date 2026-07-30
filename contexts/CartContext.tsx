'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  /** Joined product fields (populated when the API returns them) */
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  user: User | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setItems([]); // clear cart when signed out
    });
    return unsub;
  }, []);

  // ── Fetch cart from API ────────────────────────────────────────────────────
  const fetchCart = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?user_id=${encodeURIComponent(uid)}`);
      const json = await res.json();
      if (json.success) setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCart(user.uid);
  }, [user, fetchCart]);

  // ── addToCart ──────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) throw new Error('NOT_SIGNED_IN');

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          product_id: productId,
          quantity,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => [...prev, json.data]);
      } else {
        throw new Error(json.error ?? 'Failed to add to cart');
      }
    },
    [user],
  );

  // ── updateQuantity ─────────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, quantity }),
    });
    const json = await res.json();
    if (json.success) {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    } else {
      throw new Error(json.error ?? 'Failed to update quantity');
    }
  }, []);

  // ── removeFromCart ─────────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (itemId: string) => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    });
    const json = await res.json();
    if (json.success) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      throw new Error(json.error ?? 'Failed to remove from cart');
    }
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      loading,
      user,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      addToCart,
      updateQuantity,
      removeFromCart,
    }),
    [items, itemCount, subtotal, loading, user, isDrawerOpen, addToCart, updateQuantity, removeFromCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;