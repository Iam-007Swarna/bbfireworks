"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

type CartItem = {
  productId: string;
  name: string;
  unit: "box" | "pack" | "piece";
  qty: number;
};

type Props = {
  priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  >;
};

export function CartSummary({ priceMap }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("bbf_cart") || "[]");
    setItems(data);
  }, []);

  const totals = items.map((r) => {
    const p = priceMap[r.productId] || { box: null, pack: null, piece: null };
    const price =
      r.unit === "box" ? p.box : r.unit === "pack" ? p.pack : p.piece;
    const total = price == null ? null : price * r.qty;
    return { price, total };
  });

  const subtotal = totals.reduce((a, t) => a + (t.total ?? 0), 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  if (items.length === 0) {
    return (
      <div className="card p-4 text-center space-y-3">
        <ShoppingBag className="mx-auto text-gray-400" size={32} />
        <p className="text-sm text-gray-600 dark:text-gray-400">No items in cart</p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <h3 className="font-semibold">Order Summary</h3>

      <div className="space-y-2">
        {items.map((item, i) => {
          const total = totals[i].total;
          return (
            <div
              key={`${item.productId}-${item.unit}-${i}`}
              className="flex justify-between text-sm"
            >
              <div className="flex-1">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {item.qty} × {item.unit}
                </div>
              </div>
              <div className="font-medium ml-2">
                {total == null ? "—" : `₹${total.toFixed(2)}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Items ({itemCount})</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-green-700 dark:text-green-400">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
