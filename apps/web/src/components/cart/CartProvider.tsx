"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartItem, CartState } from "@/components/cart/cartTypes";
import { trackCustomerEvent } from "@/lib/analytics/events";
import { CartDrawer } from "./CartDrawer";

type CartContextValue = {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  removeItems: (productIds: string[]) => void;
  clear: () => void;
  totals: {
    itemCount: number;
    subtotalMinor: number;
  };
  toggleSelected: (productId: string) => void;
  setAllSelected: (selected: boolean) => void;
  selectedItems: CartItem[];
  selectedTotals: {
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
    if (!raw) return { items: [], selectedIds: [] };
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const items = (parsed?.items ?? []).filter((i) => i?.productId && i.quantity > 0);
    if (!items.length) return { items: [], selectedIds: [] };
    const knownIds = new Set(items.map((i) => i.productId));
    const selectedIds = Array.isArray(parsed?.selectedIds)
      ? parsed.selectedIds.filter((id) => knownIds.has(id))
      : items.map((i) => i.productId);
    return { items, selectedIds };
  } catch {
    return { items: [], selectedIds: [] };
  }
}

function writeCartToStorage(state: CartState) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], selectedIds: [] });
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
      const items = existing
        ? prev.items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + q } : i))
        : [...prev.items, { ...item, quantity: q }];
      const selectedIds = prev.selectedIds.includes(item.productId)
        ? prev.selectedIds
        : [...prev.selectedIds, item.productId];
      return { items, selectedIds };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(0, Math.floor(quantity));
    setState((prev) => {
      if (q === 0) {
        return {
          items: prev.items.filter((i) => i.productId !== productId),
          selectedIds: prev.selectedIds.filter((id) => id !== productId),
        };
      }
      return { ...prev, items: prev.items.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)) };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({
      items: prev.items.filter((i) => i.productId !== productId),
      selectedIds: prev.selectedIds.filter((id) => id !== productId),
    }));
    trackCustomerEvent({ event_name: "remove_from_cart", product_id: productId });
  }, []);

  const removeItems = useCallback((productIds: string[]) => {
    const idSet = new Set(productIds);
    setState((prev) => ({
      items: prev.items.filter((i) => !idSet.has(i.productId)),
      selectedIds: prev.selectedIds.filter((id) => !idSet.has(id)),
    }));
  }, []);

  const clear = useCallback(() => setState({ items: [], selectedIds: [] }), []);

  const toggleSelected = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(productId)
        ? prev.selectedIds.filter((id) => id !== productId)
        : [...prev.selectedIds, productId],
    }));
  }, []);

  const setAllSelected = useCallback((selected: boolean) => {
    setState((prev) => ({ ...prev, selectedIds: selected ? prev.items.map((i) => i.productId) : [] }));
  }, []);

  const totals = useMemo(() => {
    const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalMinor = state.items.reduce((acc, i) => acc + i.quantity * i.priceMinor, 0);
    return { itemCount, subtotalMinor };
  }, [state.items]);

  const selectedItems = useMemo(
    () => state.items.filter((i) => state.selectedIds.includes(i.productId)),
    [state.items, state.selectedIds]
  );

  const selectedTotals = useMemo(() => {
    const itemCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalMinor = selectedItems.reduce((acc, i) => acc + i.quantity * i.priceMinor, 0);
    return { itemCount, subtotalMinor };
  }, [selectedItems]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      addItem,
      updateQuantity,
      removeItem,
      removeItems,
      clear,
      totals,
      toggleSelected,
      setAllSelected,
      selectedItems,
      selectedTotals,
      isOpen,
      openCart,
      closeCart,
    }),
    [
      state,
      addItem,
      updateQuantity,
      removeItem,
      removeItems,
      clear,
      totals,
      toggleSelected,
      setAllSelected,
      selectedItems,
      selectedTotals,
      isOpen,
      openCart,
      closeCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {hydrated && <CartDrawer />}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
