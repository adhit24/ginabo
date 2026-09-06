"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartItem, CartState } from "@/components/cart/cartTypes";
import { trackCustomerEvent } from "@/lib/analytics/events";
import { getProductsByIds, type CatalogProduct } from "@/lib/catalog";
import { CartDrawer } from "./CartDrawer";

// Cart items are only references (product id + quantity); price, name, stock
// and availability are never trusted from the localStorage snapshot once live
// data has loaded. `null` means "looked up, no longer exists" (deleted or the
// id never resolved); a missing key means "not looked up yet".
export type LiveProductMap = Record<string, CatalogProduct | null>;

export function isItemPurchasable(live: CatalogProduct | null | undefined): boolean {
  if (live === undefined) return true; // not yet resolved — don't block optimistically
  if (live === null) return false; // deleted
  return live.isActive && live.stockQty > 0;
}

export function effectivePrice(item: CartItem, liveById: LiveProductMap): number | null {
  const live = liveById[item.productId];
  if (!isItemPurchasable(live)) return null;
  return live ? live.priceMinor : item.priceMinor;
}

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
  // Live product-catalog authority for cart items — see LiveProductMap above.
  liveById: LiveProductMap;
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
  const [liveById, setLiveById] = useState<LiveProductMap>({});

  useEffect(() => {
    setState(readCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCartToStorage(state);
  }, [hydrated, state]);

  // Re-derive price/stock/active-state from the DB for every product
  // currently referenced by the cart — the localStorage snapshot (price,
  // name, image) is never treated as authoritative once this resolves.
  const itemIdsKey = state.items.map((i) => i.productId).join(",");
  useEffect(() => {
    if (!hydrated) return;
    const ids = itemIdsKey ? itemIdsKey.split(",") : [];
    if (ids.length === 0) return;
    let cancelled = false;
    getProductsByIds(ids).then((products) => {
      if (cancelled) return;
      const found = new Map(products.map((p) => [p.id, p] as const));
      setLiveById((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = found.get(id) ?? null;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, itemIdsKey]);

  // Once live stock is known, cap any persisted quantity that exceeds it —
  // sensible cart-level validation, not stock reservation. Out-of-stock
  // items (stockQty === 0) are left as-is and excluded from totals instead,
  // so the user can see and remove them rather than having them silently
  // shrink to a misleading "0".
  useEffect(() => {
    if (!hydrated) return;
    setState((prev) => {
      let changed = false;
      const items = prev.items.map((item) => {
        const live = liveById[item.productId];
        if (live && live.isActive && live.stockQty > 0 && item.quantity > live.stockQty) {
          changed = true;
          return { ...item, quantity: live.stockQty };
        }
        return item;
      });
      return changed ? { ...prev, items } : prev;
    });
  }, [liveById, hydrated]);

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

  // Subtotal is always derived from live catalog price × validated quantity;
  // items that are deleted, inactive, or out of stock contribute 0 to the
  // monetary total (but stay visible/removable) instead of using their
  // frozen localStorage price snapshot.
  const totals = useMemo(() => {
    const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalMinor = state.items.reduce((acc, i) => {
      const price = effectivePrice(i, liveById);
      return price == null ? acc : acc + i.quantity * price;
    }, 0);
    return { itemCount, subtotalMinor };
  }, [state.items, liveById]);

  const selectedItems = useMemo(
    () => state.items.filter((i) => state.selectedIds.includes(i.productId)),
    [state.items, state.selectedIds]
  );

  const selectedTotals = useMemo(() => {
    const itemCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalMinor = selectedItems.reduce((acc, i) => {
      const price = effectivePrice(i, liveById);
      return price == null ? acc : acc + i.quantity * price;
    }, 0);
    return { itemCount, subtotalMinor };
  }, [selectedItems, liveById]);

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
      liveById,
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
      liveById,
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
