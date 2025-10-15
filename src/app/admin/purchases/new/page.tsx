// import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import React from 'react';

// type LineIn = {
//   productId: string;
//   qtyBoxes: number;
//   qtyPacks: number;
//   qtyPieces: number;
//   unitCostPiece: number; // ₹ per piece (normalized)
//   taxPct?: number;
// };

// async function createPurchase(formData: FormData) {
//   "use server";

//   const supplierName = String(formData.get("supplierName") || "").trim();
//   const dateStr = String(formData.get("date") || "");
//   const billNo = String(formData.get("billNo") || "").trim();
//   const rawLines = String(formData.get("lines") || "[]");
//   const file = formData.get("attachment") as File | null;

//   if (!supplierName || !dateStr) {
//     throw new Error("Supplier and date are required");
//   }

//   const when = new Date(dateStr);
//   const supplier = await prisma.supplier.upsert({
//     where: { name: supplierName },
//     update: {},
//     create: { name: supplierName },
//   });

//   let attachmentBytes: Buffer | undefined = undefined;
//   let attachmentMime: string | undefined = undefined;
//   if (file && file.size > 0) {
//     attachmentBytes = Buffer.from(await file.arrayBuffer());
//     attachmentMime = file.type || "application/octet-stream";
//   }

//   let lines: LineIn[] = [];
//   try {
//     lines = JSON.parse(rawLines) as LineIn[];
//   } catch {
//     lines = [];
//   }
//   lines = lines
//     .map((l) => ({
//       ...l,
//       qtyBoxes: Math.max(0, Number(l.qtyBoxes || 0)),
//       qtyPacks: Math.max(0, Number(l.qtyPacks || 0)),
//       qtyPieces: Math.max(0, Number(l.qtyPieces || 0)),
//       unitCostPiece: Number(l.unitCostPiece || 0),
//       taxPct: Number(l.taxPct || 0),
//     }))
//     .filter((l) => l.productId && (l.qtyBoxes || l.qtyPacks || l.qtyPieces) && l.unitCostPiece > 0);

//   if (!lines.length) {
//     throw new Error("Add at least one valid line");
//   }

//   // Load product unit conversions we need to compute total pieces
//   const productMap = new Map<string, { piecesPerPack: number; packsPerBox: number }>();
//   const prodIds = [...new Set(lines.map((l) => l.productId))];
//   const products = await prisma.product.findMany({
//     where: { id: { in: prodIds } },
//     select: { id: true, piecesPerPack: true, packsPerBox: true },
//   });
//   for (const p of products) productMap.set(p.id, { piecesPerPack: p.piecesPerPack, packsPerBox: p.packsPerBox });

//   // Create purchase, lines, and stock ledger (+)
//   const purchase = await prisma.purchase.create({
//     data: {
//       supplierId: supplier.id,
//       date: when,
//       billNo: billNo || null,
//       attachment: attachmentBytes,
//       attachmentMime,
//       lines: {
//         create: lines.map((l) => ({
//           productId: l.productId,
//           qtyBoxes: l.qtyBoxes,
//           qtyPacks: l.qtyPacks,
//           qtyPieces: l.qtyPieces,
//           unitCostPiece: l.unitCostPiece,
//           taxPct: l.taxPct ?? 0,
//         })),
//       },
//     },
//     select: { id: true },
//   });

//   // Insert stock ledger rows per line (normalize to pieces)
//   for (const l of lines) {
//     const conv = productMap.get(l.productId);
//     if (!conv) continue;
//     const totalPieces =
//       l.qtyBoxes * conv.packsPerBox * conv.piecesPerPack +
//       l.qtyPacks * conv.piecesPerPack +
//       l.qtyPieces;

//     if (totalPieces > 0) {
//       await prisma.stockLedger.create({
//         data: {
//           productId: l.productId,
//           deltaPieces: totalPieces,
//           unitCostPiece: l.unitCostPiece,
//           sourceType: "purchase",
//           sourceId: purchase.id,
//         },
//       });
//     }
//   }

//   revalidatePath("/admin/inventory");
//   redirect("/admin/inventory");
// }

// export default async function NewPurchase() {
//   // Minimal product list for the line builder
//   const products = await prisma.product.findMany({
//     where: { active: true },
//     select: { id: true, name: true, sku: true, piecesPerPack: true, packsPerBox: true },
//     orderBy: { name: "asc" },
//   });

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-semibold">New Purchase</h1>
//       <form action={createPurchase} className="space-y-3" encType="multipart/form-data">
//         <div className="grid sm:grid-cols-3 gap-3">
//           <label className="space-y-1">
//             <span>Supplier (create or reuse by name)</span>
//             <input className="input" name="supplierName" required placeholder="e.g., Nilganj Wholesale" />
//           </label>
//           <label className="space-y-1">
//             <span>Date</span>
//             <input className="input" name="date" type="date" required />
//           </label>
//           <label className="space-y-1">
//             <span>Bill No (optional)</span>
//             <input className="input" name="billNo" placeholder="e.g., INV-123" />
//           </label>
//         </div>

//         <div className="space-y-2">
//           <span className="font-medium">Attachment (optional)</span>
//           <input className="input" type="file" name="attachment" accept="image/*,application/pdf" />
//         </div>

//         {/* Lines builder serializes to hidden "lines" input as JSON */}
//         <LinesBuilder products={products} />

//         <button className="btn">Save Purchase</button>
//       </form>
//     </div>
//   );
// }

// /** Client component to build lines and serialize them as JSON */
// function LinesBuilder({ products }: { products: { id: string; name: string; sku: string; piecesPerPack: number; packsPerBox: number }[] }) {
//   "use client";

//   type Row = {
//     productId: string;
//     qtyBoxes: number;
//     qtyPacks: number;
//     qtyPieces: number;
//     unitCostPiece: number;
//     taxPct: number;
//   };

//   const initial: Row[] = [{ productId: products[0]?.id ?? "", qtyBoxes: 0, qtyPacks: 0, qtyPieces: 0, unitCostPiece: 0, taxPct: 0 }];
//   const rowsState = (window as any).__bbf_rows__ as Row[] | undefined;
//   const [rows, setRows] = React.useState<Row[]>(rowsState ?? initial);

//   React.useEffect(() => {
//     (window as any).__bbf_rows__ = rows;
//     const el = document.getElementById("lines-json") as HTMLInputElement | null;
//     if (el) el.value = JSON.stringify(rows);
//   }, [rows]);

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between">
//         <span className="font-medium">Lines</span>
//         <button
//           type="button"
//           className="btn"
//           onClick={() =>
//             setRows((r) => [
//               ...r,
//               { productId: products[0]?.id ?? "", qtyBoxes: 0, qtyPacks: 0, qtyPieces: 0, unitCostPiece: 0, taxPct: 0 },
//             ])
//           }
//         >
//           + Add line
//         </button>
//       </div>
//       <div className="overflow-auto">
//         <table className="min-w-full text-sm">
//           <thead className="text-left">
//             <tr>
//               <th className="p-2">Product</th>
//               <th className="p-2">Boxes</th>
//               <th className="p-2">Packs</th>
//               <th className="p-2">Pieces</th>
//               <th className="p-2">Cost / Piece (₹)</th>
//               <th className="p-2">Tax %</th>
//               <th className="p-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r, i) => {
//               const prod = products.find((p) => p.id === r.productId);
//               const piecesFromBox = prod ? prod.packsPerBox * prod.piecesPerPack * r.qtyBoxes : 0;
//               const piecesFromPack = prod ? prod.piecesPerPack * r.qtyPacks : 0;
//               const totalPieces = piecesFromBox + piecesFromPack + r.qtyPieces;

//               return (
//                 <tr key={i}>
//                   <td className="p-2">
//                     <select
//                       className="input w-52"
//                       value={r.productId}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, productId: v } : x)));
//                       }}
//                     >
//                       {products.map((p) => (
//                         <option key={p.id} value={p.id}>
//                           {p.name} ({p.sku})
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className="p-2">
//                     <input
//                       className="input w-24"
//                       type="number"
//                       min={0}
//                       value={r.qtyBoxes}
//                       onChange={(e) =>
//                         setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, qtyBoxes: Number(e.target.value || 0) } : x)))
//                       }
//                     />
//                   </td>
//                   <td className="p-2">
//                     <input
//                       className="input w-24"
//                       type="number"
//                       min={0}
//                       value={r.qtyPacks}
//                       onChange={(e) =>
//                         setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, qtyPacks: Number(e.target.value || 0) } : x)))
//                       }
//                     />
//                   </td>
//                   <td className="p-2">
//                     <input
//                       className="input w-24"
//                       type="number"
//                       min={0}
//                       value={r.qtyPieces}
//                       onChange={(e) =>
//                         setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, qtyPieces: Number(e.target.value || 0) } : x)))
//                       }
//                     />
//                   </td>
//                   <td className="p-2">
//                     <input
//                       className="input w-28"
//                       type="number"
//                       min={0}
//                       step="0.0001"
//                       value={r.unitCostPiece}
//                       onChange={(e) =>
//                         setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, unitCostPiece: Number(e.target.value || 0) } : x)))
//                       }
//                     />
//                   </td>
//                   <td className="p-2">
//                     <input
//                       className="input w-24"
//                       type="number"
//                       min={0}
//                       step="0.01"
//                       value={r.taxPct}
//                       onChange={(e) =>
//                         setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, taxPct: Number(e.target.value || 0) } : x)))
//                       }
//                     />
//                   </td>
//                   <td className="p-2">
//                     <button
//                       type="button"
//                       className="btn"
//                       onClick={() => setRows((rows) => rows.filter((_, idx) => idx !== i))}
//                     >
//                       Remove
//                     </button>
//                     <div className="text-xs opacity-70 mt-1">
//                       Total pieces: <b>{totalPieces}</b>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       <input type="hidden" id="lines-json" name="lines" defaultValue="[]" />
//     </div>
//   );
// }

import { prisma } from "@/lib/prisma";
import { createPurchase } from "./actions";
import LinesBuilder from "./LinesBuilder";

export const runtime = "nodejs";

export default async function NewPurchase() {
  // Minimal product list for the line builder
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, sku: true, piecesPerPack: true, packsPerBox: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Purchase</h1>

      <form action={createPurchase} className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span>Supplier (create or reuse by name)</span>
            <input className="input" name="supplierName" required placeholder="e.g., Nilganj Wholesale" />
          </label>
          <label className="space-y-1">
            <span>Date</span>
            <input className="input" name="date" type="date" required />
          </label>
          <label className="space-y-1">
            <span>Bill No (optional)</span>
            <input className="input" name="billNo" placeholder="e.g., INV-123" />
          </label>
        </div>

        <div className="space-y-2">
          <span className="font-medium">Attachment (optional)</span>
          <input className="input" type="file" name="attachment" accept="image/*,application/pdf" />
        </div>

        <LinesBuilder products={products} />

        <button className="btn">Save Purchase</button>
      </form>
    </div>
  );
}
