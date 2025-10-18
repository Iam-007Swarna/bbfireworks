"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, X, ArrowRight, ShoppingBag, Plus, Minus } from "lucide-react";
import Link from "next/link";

type CartClientProps = {
  priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  >;
  imageMap: Record<string, string | null>;
};

export default function CartClient({ priceMap, imageMap }: CartClientProps) {
  const [rows, setRows] = useState<
    Array<{
      productId: string;
      name: string;
      unit: "box" | "pack" | "piece";
      qty: number;
    }>
  >([]);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Use the same key as the cart utilities (bbf_cart)
    const data = JSON.parse(localStorage.getItem("bbf_cart") || "[]");
    setRows(data);
  }, []);

  const saveToLocalStorage = useCallback((data: typeof rows) => {
    localStorage.setItem("bbf_cart", JSON.stringify(data));
    // Dispatch event for cart icon update
    window.dispatchEvent(new Event("storage"));
  }, []);

  const debouncedSave = useCallback(
    (data: typeof rows) => {
      if (updateTimeout) clearTimeout(updateTimeout);
      const timeout = setTimeout(() => {
        saveToLocalStorage(data);
      }, 500);
      setUpdateTimeout(timeout);
    },
    [updateTimeout, saveToLocalStorage]
  );

  const totals = rows.map((r) => {
    const p = priceMap[r.productId] || { box: null, pack: null, piece: null };
    const price =
      r.unit === "box" ? p.box : r.unit === "pack" ? p.pack : p.piece;
    const total = price == null ? null : price * r.qty;
    return { price, total };
  });

  const grand = totals.reduce((a, t) => a + (t.total ?? 0), 0);
  const itemCount = rows.reduce((a, r) => a + r.qty, 0);

  function updateQuantity(i: number, delta: number) {
    const next = rows.slice();
    const newQty = Math.max(1, next[i].qty + delta);
    next[i] = { ...next[i], qty: newQty };
    setRows(next);
    saveToLocalStorage(next);
  }

  function setQuantity(i: number, value: string) {
    const v = Math.max(1, Number(value || "1"));
    const next = rows.slice();
    next[i] = { ...next[i], qty: v };
    setRows(next);
    debouncedSave(next);
  }

  function remove(i: number) {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    saveToLocalStorage(next);
  }

  function clear() {
    setRows([]);
    saveToLocalStorage([]);
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="text-6xl opacity-20">🛒</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start adding some fireworks to light up your celebration!
          </p>
        </div>
        <Link
          href="/"
          className="btn bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-700 inline-flex items-center gap-2"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shopping Cart</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Quantity</th>
              <th className="p-3 text-right">Price/Unit</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((r, i) => {
              const price = totals[i].price;
              const total = totals[i].total;
              const imgId = imageMap[r.productId];

              return (
                <tr key={`${r.productId}-${r.unit}-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="p-3">
                    <Link href={`/products/${r.productId}`} className="flex items-center gap-3 group">
                      {imgId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/images/${imgId}`}
                          alt={r.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <ShoppingBag size={24} className="text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {r.name}
                      </span>
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="capitalize badge">{r.unit}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(i, -1)}
                        className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                        disabled={r.qty <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        className="input w-16 text-center p-1"
                        type="number"
                        min={1}
                        value={r.qty}
                        onChange={(e) => setQuantity(i, e.target.value)}
                      />
                      <button
                        onClick={() => updateQuantity(i, 1)}
                        className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {price == null ? "—" : `₹${price.toFixed(r.unit === "piece" ? 4 : 2)}`}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {total == null ? "—" : `₹${total.toFixed(2)}`}
                  </td>
                  <td className="p-3">
                    <button
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                      onClick={() => remove(i)}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {rows.map((r, i) => {
          const price = totals[i].price;
          const total = totals[i].total;
          const imgId = imageMap[r.productId];

          return (
            <div key={`${r.productId}-${r.unit}-${i}`} className="card p-3 space-y-3">
              <Link href={`/products/${r.productId}`} className="flex gap-3">
                {imgId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/images/${imgId}`}
                    alt={r.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <ShoppingBag size={28} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">Unit: {r.unit}</div>
                  {price != null && (
                    <div className="text-sm font-medium mt-1">
                      ₹{price.toFixed(r.unit === "piece" ? 4 : 2)} each
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(i, -1)}
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                    disabled={r.qty <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    className="input w-16 text-center p-1"
                    type="number"
                    min={1}
                    value={r.qty}
                    onChange={(e) => setQuantity(i, e.target.value)}
                  />
                  <button
                    onClick={() => updateQuantity(i, 1)}
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-bold">
                    {total == null ? "—" : `₹${total.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <button
                className="btn w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 dark:border-red-800"
                onClick={() => remove(i)}
              >
                <Trash2 size={16} />
                Remove from cart
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 -mx-4 px-4 py-4 md:mx-0 md:px-0">
        <div className="card p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold">Grand Total:</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">
              ₹{grand.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/checkout"
              className="btn bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-700 flex-1 flex items-center justify-center gap-2 py-3"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>
            <button
              className="btn flex items-center justify-center gap-2"
              onClick={clear}
            >
              <X size={18} />
              Clear Cart
            </button>
          </div>

          <Link
            href="/"
            className="text-sm text-center text-blue-600 hover:underline dark:text-blue-400 block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
