// import { prisma } from "@/lib/prisma";
// import { consumeFIFOOnce } from "@/lib/fifo";
// import { toPieces, Unit } from "@/lib/units";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import React from "react";

// /* =========================
//    Server component
//    ========================= */

// /** Server: fetch active products + active retail price */
// async function productsForPOS() {
//   const now = new Date();
//   const products = await prisma.product.findMany({
//     where: { active: true },
//     select: {
//       id: true, name: true, sku: true,
//       piecesPerPack: true, packsPerBox: true,
//       allowSellBox: true, allowSellPack: true, allowSellPiece: true,
//       prices: {
//         where: {
//           channel: "retail",
//           activeFrom: { lte: now },
//           OR: [{ activeTo: null }, { activeTo: { gte: now } }],
//         },
//         orderBy: { activeFrom: "desc" },
//         take: 1,
//         select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
//       }
//     },
//     orderBy: { name: "asc" }
//   });

//   // Current stock map
//   const grouped = await prisma.stockLedger.groupBy({
//     by: ["productId"], _sum: { deltaPieces: true },
//     where: { productId: { in: products.map((p: { id: string }) => p.id) } }
//   });
//   const stock: Record<string, number> = {};
//   for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

//   return products.map((p: { id: string; name: string; sku: string; piecesPerPack: number; packsPerBox: number; allowSellBox: boolean; allowSellPack: boolean; allowSellPiece: boolean; prices: Array<{ sellPerBox: number | null; sellPerPack: number | null; sellPerPiece: number | null; }> }) => ({
//     id: p.id,
//     name: p.name,
//     sku: p.sku,
//     piecesPerPack: p.piecesPerPack,
//     packsPerBox: p.packsPerBox,
//     allow: { box: p.allowSellBox, pack: p.allowSellPack, piece: p.allowSellPiece },
//     price: {
//       box: p.prices[0]?.sellPerBox ? Number(p.prices[0]?.sellPerBox) : null,
//       pack: p.prices[0]?.sellPerPack ? Number(p.prices[0]?.sellPerPack) : null,
//       piece: p.prices[0]?.sellPerPiece ? Number(p.prices[0]?.sellPerPiece) : null,
//     },
//     stockPieces: stock[p.id] ?? 0,
//   }));
// }

// /** Server action: finalize POS invoice (no PDF yet; Bundle-11) */
// async function finalizePOS(formData: FormData) {
//   "use server";

//   const raw = String(formData.get("lines") || "[]");
//   const cashierId = String(formData.get("cashierId") || "");
//   let lines: Array<{
//     productId: string;
//     unit: Unit;
//     qty: number;
//     pricePerUnit: number;
//   }> = [];
//   try { lines = JSON.parse(raw); } catch {}

//   if (!lines.length) return;

//   // Load required product data
//   const ids = [...new Set(lines.map(l => l.productId))];
//   const products = await prisma.product.findMany({
//     where: { id: { in: ids } },
//     select: { id: true, piecesPerPack: true, packsPerBox: true }
//   });
//   type ProductInfo = {
//     id: string;
//     piecesPerPack: number;
//     packsPerBox: number;
//   };
//   const pmap = new Map<string, ProductInfo>(products.map((p: ProductInfo) => [p.id, p]));

//   // Validate stock availability
//   const stockGrouped = await prisma.stockLedger.groupBy({
//     by: ["productId"], _sum: { deltaPieces: true }, where: { productId: { in: ids } }
//   });
//   const stock: Record<string, number> = {};
//   for (const g of stockGrouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

//   for (const l of lines) {
//     const p = pmap.get(l.productId);
//     if (!p) throw new Error("Product not found");
//     const need = toPieces(l.qty, l.unit, p.piecesPerPack, p.packsPerBox);
//     if ((stock[l.productId] ?? 0) < need) {
//       throw new Error("Insufficient stock for one or more items");
//     }
//     // reserve in local map to avoid over-selling when same product repeated
//     stock[l.productId] = (stock[l.productId] ?? 0) - need;
//   }

//   // Create Order first
//   const order = await prisma.order.create({
//     data: {
//       channel: "retail",
//       status: "fulfilled",
//       createdById: cashierId || null,
//       notes: "POS sale",
//       lines: {
//         create: lines.map(l => ({
//           productId: l.productId,
//           unit: l.unit,
//           qty: l.qty,
//           pricePerUnit: l.pricePerUnit
//         }))
//       }
//     },
//     select: { id: true }
//   });

//   // Consume FIFO & compute subtotal
//   let subtotal = 0;
//   for (const l of lines) {
//     const p = pmap.get(l.productId)!;
//     const { needPieces, avgCostPiece } = await consumeFIFOOnce(
//       l.productId, l.qty, l.unit, p.piecesPerPack, p.packsPerBox, order.id
//     );
//     // revenue
//     subtotal += l.qty * l.pricePerUnit;
//     // you could store per-line COGS somewhere if you add a column later
//     void avgCostPiece; void needPieces;
//   }

//   // Create a bare Invoice (no tax, no pdf yet)
//   const invoiceNo = await nextInvoiceNumber();
//   await prisma.invoice.create({
//     data: {
//       orderId: order.id,
//       number: invoiceNo,
//       subtotal: String(subtotal),
//       tax: "0",
//       roundOff: "0",
//       grand: String(subtotal),
//       pdfBytes: Buffer.from(""), // placeholder; Bundle-11 will generate real PDF
//     }
//   });

//   revalidatePath("/admin/inventory");
//   redirect(`/admin/inventory`);
// }

// /** Generate a simple FY-based invoice number: BBF-YY-YY-#### */
// async function nextInvoiceNumber() {
//   const now = new Date();
//   const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // Apr-Mar FY
//   const yy1 = String(fyStartYear).slice(-2);
//   const yy2 = String(fyStartYear + 1).slice(-2);
//   const prefix = `BBF-${yy1}-${yy2}-`;

//   const last = await prisma.invoice.findFirst({
//     where: { number: { startsWith: prefix } },
//     orderBy: { date: "desc" },
//     select: { number: true },
//   });

//   const nextSeq = last ? (parseInt(last.number.split("-").pop() || "0", 10) + 1) : 1;
//   return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
// }

// export default async function POSPage() {
//   const items = await productsForPOS();
//   return <POSClient initial={items} />;
// }

// /* =========================
//    Client component
//    ========================= */
// function POSClient({ initial }: { initial: Awaited<ReturnType<typeof productsForPOS>> }) {
//   "use client";

//   type Row = {
//     productId: string;
//     unit: Unit;
//     qty: number;
//     pricePerUnit: number; // prefilled from retail price, editable
//     costPerUnit: number | null; // display-only (avg cost approximation pre-finalize)
//     name: string;
//     stockPieces: number;
//     piecesPerPack: number;
//     packsPerBox: number;
//   };

//   const [rows, setRows] = React.useState<Row[]>([]);
//   const [search, setSearch] = React.useState("");

//   function addProduct(pId: string, unit: Unit) {
//     const p = initial.find((x: typeof initial[0]) => x.id === pId);
//     if (!p) return;
//     const price =
//       unit === "box"  ? (p.price.box  ?? 0) :
//       unit === "pack" ? (p.price.pack ?? 0) :
//                         (p.price.piece ?? 0);

//     // crude avg cost display (from active purchases)
//     const approxPieceCost = null as number | null; // keep null; Bundle-9 page already previews costs
//     const costUnit =
//       approxPieceCost == null ? null :
//       unit === "piece" ? approxPieceCost :
//       unit === "pack"  ? approxPieceCost * p.piecesPerPack :
//                          approxPieceCost * p.piecesPerPack * p.packsPerBox;

//     setRows(r => [...r, {
//       productId: p.id, unit, qty: 1, pricePerUnit: price || 0,
//       costPerUnit: costUnit, name: p.name,
//       stockPieces: p.stockPieces, piecesPerPack: p.piecesPerPack, packsPerBox: p.packsPerBox
//     }]);
//   }

//   const subtotal = rows.reduce((a, r) => a + r.qty * r.pricePerUnit, 0);
//   const profit = rows.reduce((a, r) => a + (r.costPerUnit == null ? 0 : (r.pricePerUnit - r.costPerUnit) * r.qty), 0);

//   function toPiecesLocal(r: Row) {
//     return toPieces(r.qty, r.unit, r.piecesPerPack, r.packsPerBox);
//   }

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-semibold">Billing Counter</h1>

//       {/* Quick add */}
//       <div className="card p-3 flex flex-wrap gap-2 items-center">
//         <input
//           className="input w-64"
//           placeholder="Search product"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//         <div className="flex gap-2 flex-wrap">
//           {initial
//             .filter((p: typeof initial[0]) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
//             .slice(0, 8)
//             .map((p: typeof initial[0]) => (
//               <div key={p.id} className="flex gap-1 items-center">
//                 <span className="text-xs">{p.name}</span>
//                 {p.allow.box && <button className="btn text-xs" onClick={()=>addProduct(p.id,"box")}>+ Box</button>}
//                 {p.allow.pack && <button className="btn text-xs" onClick={()=>addProduct(p.id,"pack")}>+ Pack</button>}
//                 {p.allow.piece && <button className="btn text-xs" onClick={()=>addProduct(p.id,"piece")}>+ Piece</button>}
//               </div>
//           ))}
//         </div>
//       </div>

//       {/* Lines table */}
//       <div className="overflow-auto">
//         <table className="min-w-[900px] text-sm">
//           <thead className="text-left sticky top-0 bg-white dark:bg-black">
//             <tr>
//               <th className="p-2">Firecracker</th>
//               <th className="p-2">Quantity</th>
//               <th className="p-2">Unit</th>
//               <th className="p-2">Price/Unit (₹)</th>
//               <th className="p-2">Cost/Unit (₹)</th>
//               <th className="p-2">Total (₹)</th>
//               <th className="p-2">Profit (₹)</th>
//               <th className="p-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r, i) => {
//               const required = toPiecesLocal(r);
//               const insufficient = r.stockPieces < required;

//               return (
//                 <tr key={i} className={insufficient ? "opacity-70" : ""}>
//                   <td className="p-2">{r.name}</td>
//                   <td className="p-2">
//                     <input
//                       className="input w-24"
//                       type="number"
//                       min={1}
//                       value={r.qty}
//                       onChange={e => {
//                         const v = Math.max(1, Number(e.target.value || "1"));
//                         setRows(rs => rs.map((x, idx) => idx === i ? { ...x, qty: v } : x));
//                       }}
//                     />
//                     {insufficient && <div className="text-xs text-red-600 mt-1">Not enough stock</div>}
//                   </td>
//                   <td className="p-2">
//                     <select
//                       className="input"
//                       value={r.unit}
//                       onChange={e => setRows(rs => rs.map((x, idx) => idx === i ? { ...x, unit: e.target.value as Unit } : x))}
//                     >
//                       <option value="box">Box</option>
//                       <option value="pack">Pack</option>
//                       <option value="piece">Piece</option>
//                     </select>
//                   </td>
//                   <td className="p-2">
//                     <input
//                       className="input w-28"
//                       type="number"
//                       step="0.01"
//                       min={0}
//                       value={r.pricePerUnit}
//                       onChange={e => setRows(rs => rs.map((x, idx) => idx === i ? { ...x, pricePerUnit: Number(e.target.value || 0) } : x))}
//                     />
//                   </td>
//                   <td className="p-2">{r.costPerUnit == null ? "—" : r.costPerUnit.toFixed(r.unit === "piece" ? 4 : 2)}</td>
//                   <td className="p-2">{(r.qty * r.pricePerUnit).toFixed(2)}</td>
//                   <td className="p-2">
//                     {r.costPerUnit == null ? "—" : (r.qty * (r.pricePerUnit - r.costPerUnit)).toFixed(2)}
//                   </td>
//                   <td className="p-2">
//                     <button className="btn" onClick={()=>setRows(rs => rs.filter((_, idx) => idx !== i))}>Remove</button>
//                   </td>
//                 </tr>
//               );
//             })}
//             {rows.length === 0 && (
//               <tr><td className="p-2 text-sm opacity-70" colSpan={8}>Use the search above to add items.</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <form action={finalizePOS} className="card p-3 flex flex-wrap gap-4 items-center">
//         <input type="hidden" name="cashierId" value="" />
//         <input type="hidden" id="pos-lines" name="lines" defaultValue="[]" />
//         <TotalsWriter rows={rows} />
//         <div>Subtotal: <b>₹{subtotal.toFixed(2)}</b></div>
//         <div>Profit (approx): <b className={profit>=0?"text-green-600":"text-red-600"}>₹{profit.toFixed(2)}</b></div>
//         <button className="btn" disabled={!rows.length}>Finalize Invoice</button>
//       </form>
//     </div>
//   );
// }

// /** Writes current rows into hidden input before submit */
// function TotalsWriter({ rows }: { rows: any[] }) {
//   "use client";
//   React.useEffect(() => {
//     const el = document.getElementById("pos-lines") as HTMLInputElement | null;
//     if (el) el.value = JSON.stringify(rows.map(r => ({
//       productId: r.productId, unit: r.unit, qty: r.qty, pricePerUnit: r.pricePerUnit
//     })));
//   }, [rows]);
//   return null;
// }

import { Suspense } from "react";
import { productsForPOS } from "./actions";
import POSClient from "./POSClient";

export const runtime = "nodejs";

export default async function POSPage() {
  const items = await productsForPOS();
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <POSClient initial={items} />
    </Suspense>
  );
}