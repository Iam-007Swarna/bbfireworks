"use client";

export type CartUnit = "box" | "pack" | "piece";
export type CartItem = {
  productId: string;
  name: string;
  unit: CartUnit;
  qty: number;
};

const KEY = "bbf_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const cur = readCart();
  const idx = cur.findIndex(
    (x) => x.productId === item.productId && x.unit === item.unit
  );
  if (idx >= 0) {
    cur[idx].qty += item.qty;
  } else {
    cur.push(item);
  }
  writeCart(cur);
}

export function removeFromCart(productId: string, unit: CartUnit) {
  const cur = readCart().filter((x) => !(x.productId === productId && x.unit === unit));
  writeCart(cur);
}

export function clearCart() {
  writeCart([]);
}
