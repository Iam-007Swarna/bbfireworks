// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { CartItem, readCart, removeFromCart, writeCart } from "@/components/cart/useCart";
// import { Button } from "@/components/ui/Button";

// export default function CartPage() {
//   const [items, setItems] = useState<CartItem[]>([]);

//   useEffect(() => {
//     setItems(readCart());
//   }, []);

//   const totalLines = useMemo(() => items.length, [items]);

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-semibold">Your Cart</h1>

//       {items.length === 0 ? (
//         <p className="opacity-80">Your cart is empty. Browse products to add items.</p>
//       ) : (
//         <>
//           <div className="overflow-auto">
//             <table className="min-w-full text-sm">
//               <thead className="text-left">
//                 <tr>
//                   <th className="p-2">Firecracker</th>
//                   <th className="p-2">Unit</th>
//                   <th className="p-2">Qty</th>
//                   <th className="p-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((it, i) => (
//                   <tr key={`${it.productId}-${it.unit}-${i}`}>
//                     <td className="p-2">{it.name}</td>
//                     <td className="p-2 capitalize">{it.unit}</td>
//                     <td className="p-2">
//                       <input
//                         className="input w-24"
//                         type="number"
//                         min={1}
//                         value={it.qty}
//                         onChange={(e) => {
//                           const v = Math.max(1, Number(e.target.value || "1"));
//                           const next = [...items];
//                           next[i] = { ...next[i], qty: v };
//                           setItems(next);
//                           writeCart(next);
//                         }}
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => {
//                           removeFromCart(it.productId, it.unit);
//                           setItems(readCart());
//                         }}
//                       >
//                         Remove
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="text-sm opacity-80">{totalLines} line(s)</div>
//             <a className="btn" href="/checkout">Proceed to checkout</a>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React from "react";
import { prisma } from "@/lib/prisma";

export default async function CartPage() {
  // We do server-side price lookup for safety (unit prices may change)
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { active: true, visibleOnMarketplace: true },
    select: {
      id: true,
      name: true,
      sku: true,
      piecesPerPack: true,
      packsPerBox: true,
      allowSellBox: true,
      allowSellPack: true,
      allowSellPiece: true,
      prices: {
        where: {
          channel: "marketplace",
          activeFrom: { lte: now },
          OR: [{ activeTo: null }, { activeTo: { gte: now } }],
        },
        orderBy: { activeFrom: "desc" },
        take: 1,
        select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
      },
    },
  });

  const priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  > = {};
  for (const p of products) {
    const pr = p.prices[0];
    priceMap[p.id] = {
      box: pr?.sellPerBox ? Number(pr.sellPerBox) : null,
      pack: pr?.sellPerPack ? Number(pr.sellPerPack) : null,
      piece: pr?.sellPerPiece ? Number(pr.sellPerPiece) : null,
    };
  }

  return <CartClient priceMap={priceMap} />;
}

function CartClient({
  priceMap,
}: {
  priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  >;
}) {
  "use client";
  const [rows, setRows] = React.useState<
    Array<{
      productId: string;
      name: string;
      unit: "box" | "pack" | "piece";
      qty: number;
    }>
  >([]);

  React.useEffect(() => {
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
                    <button className="btn" onClick={() => remove(i)}>
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
        <a className="btn" href="/checkout">
          Proceed to checkout
        </a>
        <button className="btn" onClick={clear}>
          Clear cart
        </button>
      </div>
    </div>
  );
}
