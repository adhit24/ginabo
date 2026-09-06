"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { CartItem, CartState } from "@/components/cart/cartTypes";
import { trackCustomerEvent } from "@/lib/analytics/events";
import { getProductsByIds, type CatalogProduct } from "@/lib/catalog";
import { useAuth } from "@/components/auth/AuthProvider";
import { CartDrawer } from "./CartDrawer";

// A DB product id is always a UUID; a bundle's fixed catalog id ("b1"..)
// never matches this. Only UUID-shaped ids are sent to the live-lookup query
// — bundles have no `products` row to look up, and this also stops a
// malformed/tampered productId from crashing the batched query for every
// other item in the cart (Postgres rejects a non-UUID literal against a
// `uuid` column for the whole `IN (...)` list, not just the bad value).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// Guest cart keeps the original key (no migration needed for existing
// devices). Each authenticated user gets their own isolated key so logging
// into a second account on the same browser never inherits the first
// account's cart — see CartProvider's auth-transition effect below.
const GUEST_STORAGE_KEY = "ginabo_cart_v1";
const userStorageKey = (userId: string) => `ginabo_cart_user_${userId}_v1`;

function sanitizeQuantity(raw: unknown): number {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

// Defends cart hydration against hand-edited/corrupted localStorage: missing
// or non-string productId, non-integer/negative/string/null quantity, and
// duplicate lines for the same product (coalesced by summing quantity, the
// same invariant addItem already maintains for normal use).
function readCartFromStorage(key: string): CartState {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return { items: [], selectedIds: [] };
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];

    const coalesced = new Map<string, CartItem>();
    for (const i of rawItems as Array<Record<string, unknown>>) {
      if (!i || typeof i.productId !== "string" || i.productId.length === 0) continue;
      const quantity = sanitizeQuantity(i.quantity);
      if (quantity <= 0) continue;
      const existing = coalesced.get(i.productId);
      if (existing) {
        existing.quantity += quantity;
        continue;
      }
      coalesced.set(i.productId, {
        productId: i.productId,
        slug: typeof i.slug === "string" ? i.slug : "",
        name: typeof i.name === "string" ? i.name : "",
        priceMinor: typeof i.priceMinor === "number" && Number.isFinite(i.priceMinor) ? i.priceMinor : 0,
        currency: i.currency === "USD" ? "USD" : "IDR",
        imageUrl: typeof i.imageUrl === "string" ? i.imageUrl : null,
        weightGrams: typeof i.weightGrams === "number" ? i.weightGrams : null,
        quantity,
      });
    }

    const items = Array.from(coalesced.values());
    if (items.length === 0) return { items: [], selectedIds: [] };
    const knownIds = new Set(items.map((i) => i.productId));
    const selectedIds = Array.isArray(parsed?.selectedIds)
      ? (parsed.selectedIds as unknown[]).filter((id): id is string => typeof id === "string" && knownIds.has(id))
      : items.map((i) => i.productId);
    return { items, selectedIds };
  } catch {
    return { items: [], selectedIds: [] };
  }
}

function writeCartToStorage(key: string, state: CartState) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(state));
  } catch {}
}

// Guest items + the target account's existing items, deduped by productId
// (quantities summed). Quantity overflow past live stock is left to the
// existing post-hydration stock-clamp effect, so merge doesn't need its own
// stock logic.
function mergeCarts(base: CartState, incoming: CartState): CartState {
  const items = base.items.map((i) => ({ ...i }));
  const indexByProductId = new Map(items.map((i, idx) => [i.productId, idx] as const));
  for (const inc of incoming.items) {
    const idx = indexByProductId.get(inc.productId);
    if (idx !== undefined) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + inc.quantity };
    } else {
      items.push({ ...inc });
      indexByProductId.set(inc.productId, items.length - 1);
    }
  }
  const selectedIds = Array.from(new Set([...base.selectedIds, ...incoming.selectedIds]));
  return { items, selectedIds };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<CartState>({ items: [], selectedIds: [] });
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [liveById, setLiveById] = useState<LiveProductMap>({});

  // Which storage key `state` currently represents, and whose cart it was
  // last loaded for — both refs, not state, so the effects below can read
  // "current" values without re-running on every render/keystroke.
  const activeKeyRef = useRef<string>(GUEST_STORAGE_KEY);
  const loadedForUserIdRef = useRef<string | null | undefined>(undefined); // undefined = never hydrated yet
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initial hydration waits for auth to resolve first — reading the guest
  // key before a returning user's session is confirmed would flash the
  // wrong cart and, worse, could persist a bogus write to the wrong bucket.
  useEffect(() => {
    if (authLoading || hydrated) return;
    const userId = user?.id ?? null;
    const key = userId ? userStorageKey(userId) : GUEST_STORAGE_KEY;
    let cart = readCartFromStorage(key);

    // First hydration as a logged-in user: fold in whatever a guest built
    // on this device before ever logging in, then empty the guest bucket so
    // it isn't merged again on a later logout/login cycle.
    if (userId) {
      const guestCart = readCartFromStorage(GUEST_STORAGE_KEY);
      if (guestCart.items.length > 0) {
        cart = mergeCarts(cart, guestCart);
        writeCartToStorage(GUEST_STORAGE_KEY, { items: [], selectedIds: [] });
      }
    }

    activeKeyRef.current = key;
    loadedForUserIdRef.current = userId;
    setState(cart);
    setHydrated(true);
  }, [authLoading, hydrated, user]);

  // Live auth transitions after initial hydration: login, logout, or
  // (without an intervening logout) switching straight to a different
  // account. Each transition loads the target account's own key; only the
  // guest→login edge merges — logout never lets the next account inherit
  // the previous one's cart, and logout itself doesn't carry the just-
  // logged-out user's items into the guest bucket.
  useEffect(() => {
    if (!hydrated || authLoading) return;
    const userId = user?.id ?? null;
    if (loadedForUserIdRef.current === userId) return; // no transition

    const wasGuest = loadedForUserIdRef.current === null;
    const key = userId ? userStorageKey(userId) : GUEST_STORAGE_KEY;
    let cart = readCartFromStorage(key);

    if (userId && wasGuest) {
      const guestCart = stateRef.current;
      if (guestCart.items.length > 0) {
        cart = mergeCarts(cart, guestCart);
      }
      writeCartToStorage(GUEST_STORAGE_KEY, { items: [], selectedIds: [] });
    }

    activeKeyRef.current = key;
    loadedForUserIdRef.current = userId;
    setState(cart);
  }, [user, authLoading, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeCartToStorage(activeKeyRef.current, state);
  }, [hydrated, state]);

  // Re-derive price/stock/active-state from the DB for every product
  // currently referenced by the cart — the localStorage snapshot (price,
  // name, image) is never treated as authoritative once this resolves.
  const itemIdsKey = state.items.map((i) => i.productId).join(",");
  useEffect(() => {
    if (!hydrated) return;
    const ids = (itemIdsKey ? itemIdsKey.split(",") : []).filter((id) => UUID_RE.test(id));
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
