// import { prisma } from "@/lib/prisma";
// import { avgCostPiece } from "@/lib/cost";
// import { revalidatePath } from "next/cache";

// type PriceInput = {
//   productId: string;
//   channel: "marketplace" | "retail";
//   sellPerBox?: number | null;
//   sellPerPack?: number | null;
//   sellPerPiece?: number | null;
// };

// async function upsertActivePrice({
//   productId,
//   channel,
//   sellPerBox,
//   sellPerPack,
//   sellPerPiece,
// }: PriceInput) {
//   // Close any active price for this channel
//   const now = new Date();
//   await prisma.priceList.updateMany({
//     where: {
//       productId,
//       channel,
//       activeFrom: { lte: now },
//       OR: [{ activeTo: null }, { activeTo: { gt: now } }],
//     },
//     data: { activeTo: now },
//   });

//   // Create a new record (some fields may be null)
//   await prisma.priceList.create({
//     data: {
//       productId,
//       channel,
//       sellPerBox: sellPerBox ?? null,
//       sellPerPack: sellPerPack ?? null,
//       sellPerPiece: sellPerPiece ?? null,
//       activeFrom: now,
//     },
//   });
// }

// async function saveRow(formData: FormData) {
//   "use server";

//   const productId = String(formData.get("productId") || "");
//   const marketBox = numOrNull(formData.get("mk_box"));
//   const marketPack = numOrNull(formData.get("mk_pack"));
//   const marketPiece = numOrNull(formData.get("mk_piece"));
//   const retailBox = numOrNull(formData.get("rt_box"));
//   const retailPack = numOrNull(formData.get("rt_pack"));
//   const retailPiece = numOrNull(formData.get("rt_piece"));

//   if (!productId) return;

//   await upsertActivePrice({
//     productId,
//     channel: "marketplace",
//     sellPerBox: marketBox,
//     sellPerPack: marketPack,
//     sellPerPiece: marketPiece,
//   });

//   await upsertActivePrice({
//     productId,
//     channel: "retail",
//     sellPerBox: retailBox,
//     sellPerPack: retailPack,
//     sellPerPiece: retailPiece,
//   });

//   revalidatePath("/admin/pricing");
// }

// function numOrNull(v: FormDataEntryValue | null): number | null {
//   const s = String(v || "").trim();
//   if (!s) return null;
//   const n = Number(s);
//   return Number.isFinite(n) ? n : null;
// }

// type Product = {
//   id: string;
//   name: string;
//   sku: string;
//   piecesPerPack: number;
//   packsPerBox: number;
//   allowSellBox: boolean;
//   allowSellPack: boolean;
//   allowSellPiece: boolean;
// };

// export default async function PricingPage() {
//   const products = await prisma.product.findMany({
//     where: { active: true },
//     select: {
//       id: true,
//       name: true,
//       sku: true,
//       piecesPerPack: true,
//       packsPerBox: true,
//       allowSellBox: true,
//       allowSellPack: true,
//       allowSellPiece: true,
//     },
//     orderBy: { name: "asc" },
//   }) as Product[];

//   const now = new Date();

//   // Fetch active prices for both channels in one go
//   const prices = await prisma.priceList.findMany({
//     where: {
//       productId: { in: products.map((p: { id: string }) => p.id) },
//       activeFrom: { lte: now },
//       OR: [{ activeTo: null }, { activeTo: { gte: now } }],
//     },
//     select: {
//       productId: true,
//       channel: true,
//       sellPerBox: true,
//       sellPerPack: true,
//       sellPerPiece: true,
//     },
//   });

//   const priceKey = (productId: string, channel: "marketplace" | "retail") =>
//     `${productId}:${channel}`;
//   const map = new Map<string, (typeof prices)[number]>();
//   for (const p of prices) map.set(priceKey(p.productId, p.channel as any), p);

//   // Precompute avg cost per piece for margin preview
//   const avgCost = new Map<string, number | null>();
//   for (const p of products) {
//     // eslint-disable-next-line no-await-in-loop
//     const c = await avgCostPiece(p.id);
//     avgCost.set(p.id, c);
//   }

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-semibold">Pricing</h1>
//       <p className="text-sm opacity-80">
//         Set active prices per channel. Leaving a field blank disables that unit for that channel.
//         Margin preview uses weighted average purchase cost per piece.
//       </p>

//       <div className="overflow-auto">
//         <table className="min-w-[900px] text-sm">
//           <thead className="text-left">
//             <tr>
//               <th className="p-2">Product</th>
//               <th className="p-2">SKU</th>
//               <th className="p-2">Cost • piece/pack/box (₹)</th>
//               <th className="p-2">Marketplace • box/pack/piece</th>
//               <th className="p-2">Retail • box/pack/piece</th>
//               <th className="p-2">Margin % (marketplace)</th>
//               <th className="p-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((p) => {
//               const mk = map.get(priceKey(p.id, "marketplace"));
//               const rt = map.get(priceKey(p.id, "retail"));
//               const cPiece = avgCost.get(p.id) ?? null;
//               const cPack = cPiece != null ? cPiece * p.piecesPerPack : null;
//               const cBox =
//                 cPiece != null ? cPiece * p.piecesPerPack * p.packsPerBox : null;

//               const mkBox = mk?.sellPerBox ? Number(mk.sellPerBox) : null;
//               const mkPack = mk?.sellPerPack ? Number(mk.sellPerPack) : null;
//               const mkPiece = mk?.sellPerPiece ? Number(mk.sellPerPiece) : null;

//               const marginPct = (sell: number | null, cost: number | null) => {
//                 if (sell == null || cost == null || sell <= 0) return "—";
//                 const m = ((sell - cost) / sell) * 100;
//                 return `${m.toFixed(1)}%`;
//               };

//               return (
//                 <tr key={p.id} className="align-top">
//                   <td className="p-2">{p.name}</td>
//                   <td className="p-2">{p.sku}</td>

//                   <td className="p-2">
//                     <div className="opacity-80">
//                       piece: <b>{fmt(cPiece, 4)}</b>
//                     </div>
//                     <div className="opacity-80">
//                       pack: <b>{fmt(cPack, 2)}</b>
//                     </div>
//                     <div className="opacity-80">
//                       box: <b>{fmt(cBox, 2)}</b>
//                     </div>
//                   </td>

//                   <td className="p-2">
//                     <RowForm
//                       productId={p.id}
//                       channel="marketplace"
//                       defaults={{
//                         box: mkBox,
//                         pack: mkPack,
//                         piece: mkPiece,
//                       }}
//                       allow={{
//                         box: p.allowSellBox,
//                         pack: p.allowSellPack,
//                         piece: p.allowSellPiece,
//                       }}
//                     />
//                   </td>

//                   <td className="p-2">
//                     <RowForm
//                       productId={p.id}
//                       channel="retail"
//                       defaults={{
//                         box: rt?.sellPerBox ? Number(rt.sellPerBox) : null,
//                         pack: rt?.sellPerPack ? Number(rt.sellPerPack) : null,
//                         piece: rt?.sellPerPiece ? Number(rt.sellPerPiece) : null,
//                       }}
//                       allow={{
//                         box: p.allowSellBox,
//                         pack: p.allowSellPack,
//                         piece: p.allowSellPiece,
//                       }}
//                     />
//                   </td>

//                   <td className="p-2">
//                     <div>box: {marginPct(mkBox, cBox)}</div>
//                     <div>pack: {marginPct(mkPack, cPack)}</div>
//                     <div>piece: {marginPct(mkPiece, cPiece)}</div>
//                   </td>

//                   <td className="p-2">
//                     <form action={saveRow}>
//                       <input type="hidden" name="productId" value={p.id} />
//                       {/* Pull values from the two RowForm fieldsets via JS (client) */}
//                       <ClientCollectFields productId={p.id} />
//                       <button className="btn">Save</button>
//                     </form>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function fmt(n: number | null | undefined, digits = 2) {
//   if (n == null) return "—";
//   return `₹${n.toFixed(digits)}`;
// }

// /**
//  * A small client helper that copies the three inputs from both channel fieldsets
//  * into the hidden inputs of the enclosing Save form.
//  */
// function ClientCollectFields({ productId }: { productId: string }) {
//   "use client";
//   return (
//     <script
//       dangerouslySetInnerHTML={{
//         __html: `
// (function(){
//   var form = document.currentScript && document.currentScript.parentElement;
//   if(!form) return;

//   function sync() {
//     function val(id){ var el = document.getElementById(id); return el ? el.value : ""; }
//     var mkb = val("mk_box_${productId}");
//     var mkp = val("mk_pack_${productId}");
//     var mkpce = val("mk_piece_${productId}");
//     var rtb = val("rt_box_${productId}");
//     var rtp = val("rt_pack_${productId}");
//     var rtpce = val("rt_piece_${productId}");
//     setHidden("mk_box", mkb);
//     setHidden("mk_pack", mkp);
//     setHidden("mk_piece", mkpce);
//     setHidden("rt_box", rtb);
//     setHidden("rt_pack", rtp);
//     setHidden("rt_piece", rtpce);
//   }
//   function setHidden(name, value){
//     var input = form.querySelector('input[name="'+name+'"]');
//     if(!input){
//       input = document.createElement('input');
//       input.type = 'hidden';
//       input.name = name;
//       form.appendChild(input);
//     }
//     input.value = value;
//   }

//   // initial sync and on input changes
//   sync();
//   document.addEventListener("input", function(e){
//     var id = e.target && e.target.id;
//     if(!id) return;
//     if(id.endsWith("${productId}") && (id.startsWith("mk_") || id.startsWith("rt_"))) {
//       sync();
//     }
//   });
// })();
// `,
//       }}
//     />
//   );
// }

// /** Fieldset with three inputs for a channel; IDs are unique per productId */
// function RowForm({
//   productId,
//   channel,
//   defaults,
//   allow,
// }: {
//   productId: string;
//   channel: "marketplace" | "retail";
//   defaults: { box: number | null; pack: number | null; piece: number | null };
//   allow: { box: boolean; pack: boolean; piece: boolean };
// }) {
//   return (
//     <fieldset className="grid grid-cols-3 gap-2">
//       <input
//         id={`${channel === "marketplace" ? "mk" : "rt"}_box_${productId}`}
//         className="input"
//         type="number"
//         step="0.01"
//         min={0}
//         placeholder="Box ₹"
//         defaultValue={defaults.box ?? ""}
//         disabled={!allow.box}
//       />
//       <input
//         id={`${channel === "marketplace" ? "mk" : "rt"}_pack_${productId}`}
//         className="input"
//         type="number"
//         step="0.01"
//         min={0}
//         placeholder="Pack ₹"
//         defaultValue={defaults.pack ?? ""}
//         disabled={!allow.pack}
//       />
//       <input
//         id={`${channel === "marketplace" ? "mk" : "rt"}_piece_${productId}`}
//         className="input"
//         type="number"
//         step="0.0001"
//         min={0}
//         placeholder="Piece ₹"
//         defaultValue={defaults.piece ?? ""}
//         disabled={!allow.piece}
//       />
//     </fieldset>
//   );
// }

import { prisma } from "@/lib/prisma";
import { saveRow } from "./actions";
import RowForm from "./RowForm";
import { avgCostPiece } from "@/lib/cost";

export const runtime = "nodejs";

type Product = {
  id: string;
  name: string;
  sku: string;
  piecesPerPack: number;
  packsPerBox: number;
  allowSellBox: boolean;
  allowSellPack: boolean;
  allowSellPiece: boolean;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function fmtMoney(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  // For tiny piece prices, show both currency and fixed if helpful
  if (digits > 2) return `${inr.format(n)} (${n.toFixed(digits)})`;
  return inr.format(n);
}

export default async function PricingPage() {
  const products = (await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      sku: true,
      piecesPerPack: true,
      packsPerBox: true,
      allowSellBox: true,
      allowSellPack: true,
      allowSellPiece: true,
    },
    orderBy: { name: "asc" },
  })) as Product[];

  const now = new Date();

  // Fetch active prices (both channels) in one go
  const prices = await prisma.priceList.findMany({
    where: {
      productId: { in: products.map((p) => p.id) },
      activeFrom: { lte: now },
      OR: [{ activeTo: null }, { activeTo: { gte: now } }],
    },
    select: {
      productId: true,
      channel: true,
      sellPerBox: true,
      sellPerPack: true,
      sellPerPiece: true,
    },
  });

  const priceKey = (productId: string, channel: "marketplace" | "retail") => `${productId}:${channel}`;
  const map = new Map<string, (typeof prices)[number]>();
  for (const p of prices) map.set(priceKey(p.productId, p.channel as "marketplace" | "retail"), p);

  // Parallelize avg cost lookups (avoid N+1)
  const avgCostEntries = await Promise.all(
    products.map(async (p) => [p.id, await avgCostPiece(p.id)] as const),
  );
  const avgCost = new Map<string, number | null>(avgCostEntries);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pricing</h1>
      <p className="text-sm opacity-80">
        Set active prices per channel. Leaving a field blank disables that unit for that channel.
        Margin preview uses weighted average purchase cost per piece.
      </p>

      <div className="overflow-auto">
        <table className="min-w-[900px] text-sm">
          <thead className="text-left">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Cost • piece/pack/box (₹)</th>
              <th className="p-2">Marketplace • box/pack/piece</th>
              <th className="p-2">Retail • box/pack/piece</th>
              <th className="p-2">Margin % (marketplace)</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const mk = map.get(priceKey(p.id, "marketplace"));
              const rt = map.get(priceKey(p.id, "retail"));
              const cPiece = avgCost.get(p.id) ?? null;
              const cPack = cPiece != null ? cPiece * p.piecesPerPack : null;
              const cBox = cPiece != null ? cPiece * p.piecesPerPack * p.packsPerBox : null;

              const mkBox = mk?.sellPerBox != null ? Number(mk.sellPerBox) : null;
              const mkPack = mk?.sellPerPack != null ? Number(mk.sellPerPack) : null;
              const mkPiece = mk?.sellPerPiece != null ? Number(mk.sellPerPiece) : null;

              const marginPct = (sell: number | null, cost: number | null) => {
                if (sell == null || cost == null || sell <= 0) return "—";
                const m = ((sell - cost) / sell) * 100;
                return `${m.toFixed(1)}%`;
              };

              return (
                <tr key={p.id} className="align-top">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.sku}</td>

                  <td className="p-2">
                    <div className="opacity-80">piece: <b>{fmtMoney(cPiece, 4)}</b></div>
                    <div className="opacity-80">pack: <b>{fmtMoney(cPack)}</b></div>
                    <div className="opacity-80">box: <b>{fmtMoney(cBox)}</b></div>
                  </td>

                  <td className="p-2">
                    <RowForm
                      productId={p.id}
                      channel="marketplace"
                      defaults={{ box: mkBox, pack: mkPack, piece: mkPiece }}
                      allow={{ box: p.allowSellBox, pack: p.allowSellPack, piece: p.allowSellPiece }}
                    />
                  </td>

                  <td className="p-2">
                    <RowForm
                      productId={p.id}
                      channel="retail"
                      defaults={{
                        box: rt?.sellPerBox != null ? Number(rt.sellPerBox) : null,
                        pack: rt?.sellPerPack != null ? Number(rt.sellPerPack) : null,
                        piece: rt?.sellPerPiece != null ? Number(rt.sellPerPiece) : null,
                      }}
                      allow={{ box: p.allowSellBox, pack: p.allowSellPack, piece: p.allowSellPiece }}
                    />
                  </td>

                  <td className="p-2">
                    <div>box: {marginPct(mkBox, cBox)}</div>
                    <div>pack: {marginPct(mkPack, cPack)}</div>
                    <div>piece: {marginPct(mkPiece, cPiece)}</div>
                  </td>

                  <td className="p-2">
                    <form action={saveRow}>
                      <input type="hidden" name="productId" value={p.id} />
                      {/* RowForm inputs are named mk_* and rt_* and live inside this form, so no client “collector” needed */}
                      <button className="btn">Save</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

