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

import { prisma } from "@/lib/prisma";
import { getAllInventory } from "@/lib/inventoryCache";
import CartClient from "./CartClient";

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
      images: { select: { id: true }, take: 1 },
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

  // Fetch inventory data from cache
  const inventoryMap = await getAllInventory();

  const priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  > = {};
  const imageMap: Record<string, string | null> = {};
  const inventoryData: Record<
    string,
    { availableBoxes: number; availablePacks: number; availablePieces: number }
  > = {};
  const productInfoMap: Record<
    string,
    {
      name: string;
      allowSellBox: boolean;
      allowSellPack: boolean;
      allowSellPiece: boolean;
    }
  > = {};

  for (const p of products) {
    const pr = p.prices[0];
    priceMap[p.id] = {
      box: pr?.sellPerBox ? Number(pr.sellPerBox) : null,
      pack: pr?.sellPerPack ? Number(pr.sellPerPack) : null,
      piece: pr?.sellPerPiece ? Number(pr.sellPerPiece) : null,
    };
    imageMap[p.id] = p.images[0]?.id ?? null;

    const inventory = inventoryMap.get(p.id);
    inventoryData[p.id] = {
      availableBoxes: inventory?.availableBoxes ?? 0,
      availablePacks: inventory?.availablePacks ?? 0,
      availablePieces: inventory?.availablePieces ?? 0,
    };

    productInfoMap[p.id] = {
      name: p.name,
      allowSellBox: p.allowSellBox,
      allowSellPack: p.allowSellPack,
      allowSellPiece: p.allowSellPiece,
    };
  }

  return (
    <CartClient
      priceMap={priceMap}
      imageMap={imageMap}
      inventoryData={inventoryData}
      productInfoMap={productInfoMap}
    />
  );
}
