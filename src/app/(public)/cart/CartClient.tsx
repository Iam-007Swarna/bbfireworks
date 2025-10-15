"use client";

import { useState, useEffect } from "react";
import { Trash2, X, ArrowRight } from "lucide-react";

type CartClientProps = {
  priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  >;
};

export default function CartClient({ priceMap }: CartClientProps) {
  const [rows, setRows] = useState<
    Array<{
      productId: string;
      name: string;
      unit: "box" | "pack" | "piece";
      qty: number;
    }>
  >([]);

  useEffect(() => {
    // Use the same key as the cart utilities (bbf_cart)
    const data = JSON.parse(localStorage.getItem("bbf_cart") || "[]");
    setRows(data);
  }, []);

  const totals = rows.map((r) => {
    const p = priceMap[r.productId] || { box: null, pack: null, piece: null };
    const price =
      r.unit === "box" ? p.box : r.unit === "pack" ? p.pack : p.piece;
    const total = price == null ? null : price * r.qty;
    return { price, total };
  });

  const grand = totals.reduce((a, t) => a + (t.total ?? 0), 0);

  function remove(i: number) {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    localStorage.setItem("bbf_cart", JSON.stringify(next));
  }

  function clear() {
    setRows([]);
    localStorage.setItem("bbf_cart", JSON.stringify([]));
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Cart</h1>
      <div className="overflow-auto">
        <table className="min-w-[700px] text-sm">
          <thead className="text-left">
            <tr>
              <th className="p-2">Firecracker</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Price/Unit (₹)</th>
              <th className="p-2">Total (₹)</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const price = totals[i].price;
              const total = totals[i].total;
              return (
                <tr key={`${r.productId}-${r.unit}-${i}`}>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 capitalize">{r.unit}</td>
                  <td className="p-2">
                    <input
                      className="input w-24"
                      type="number"
                      min={1}
                      value={r.qty}
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value || "1"));
                        const next = rows.slice();
                        next[i] = { ...r, qty: v };
                        setRows(next);
                        localStorage.setItem("bbf_cart", JSON.stringify(next));
                      }}
                    />
                  </td>
                  <td className="p-2">
                    {price == null
                      ? "—"
                      : price.toFixed(r.unit === "piece" ? 4 : 2)}
                  </td>
                  <td className="p-2">
                    {total == null ? "—" : total.toFixed(2)}
                  </td>
                  <td className="p-2">
                    <button className="btn flex items-center gap-1.5" onClick={() => remove(i)}>
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-2 text-sm opacity-70" colSpan={6}>
                  Your cart is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-3 flex gap-4 items-center">
        <div>
          Grand Total (approx): <b>₹{grand.toFixed(2)}</b>
        </div>
        <a className="btn flex items-center gap-1.5" href="/checkout">
          Proceed to checkout
          <ArrowRight size={16} />
        </a>
        <button className="btn flex items-center gap-1.5" onClick={clear}>
          <X size={16} />
          Clear cart
        </button>
      </div>
    </div>
  );
}
