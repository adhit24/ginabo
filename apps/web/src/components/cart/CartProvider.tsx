"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartItem, CartState } from "@/components/cart/cartTypes";
import { CartDrawer } from "./CartDrawer";

type CartContextValue = {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totals: {
    itemCount: number;
    subtotalMinor: number;
  };
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ginabo_cart_v1";

function readCartFromStorage(): CartState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed?.items?.length) return { items: [] };
    return { items: parsed.items.filter((i) => i?.productId && i.quantity > 0) };
  } catch {
    return { items: [] };
  }
}

function writeCartToStorage(state: CartState) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] });
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setState(readCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCartToStorage(state);
  }, [hydrated, state]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const q = Math.max(1, Math.floor(quantity));
    setState((prev) => {
      const existing = prev.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          items: prev.items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + q } : i))
        };
      }
      return { items: [...prev.items, { ...item, quantity: q }] };
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(0, Math.floor(quantity));
    setState((prev) => {
      if (q === 0) return { items: prev.items.filter((i) => i.productId !== productId) };
      return { items: prev.items.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)) };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({ items: prev.items.filter((i) => i.productId !== productId) }));
  }, []);

  const clear = useCallback(() => setState({ items: [] }), []);

  const totals = useMemo(() => {
    const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalMinor = state.items.reduce((acc, i) => acc + i.quantity * i.priceMinor, 0);
    return { itemCount, subtotalMinor };
  }, [state.items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => ({ state, addItem, updateQuantity, removeItem, clear, totals, isOpen, openCart, closeCart }), [
    state,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    totals,
    isOpen,
    openCart,
    closeCart
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
