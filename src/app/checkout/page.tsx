// // import { redirect } from "next/navigation";
// // import { prisma } from "@/lib/prisma";

// // async function createOrder(formData: FormData) {
// //   "use server";
// //   const name = String(formData.get("name")||"");
// //   const phone = String(formData.get("phone")||"");
// //   const address = String(formData.get("address")||"");
// //   const items = JSON.parse(String(formData.get("items")||"[]")) as Array<{productId:string,name:string,unit:string,qty:number,price:number,total:number}>;

// //   // Create DB order in pending_whatsapp
// //   if (items.length) {
// //     await prisma.order.create({
// //       data: {
// //         channel: "marketplace",
// //         status: "pending_whatsapp",
// //         notes: `Guest checkout: ${name} / ${phone}`,
// //         lines: {
// //           create: items.map(i=>({
// //             productId: i.productId,
// //             unit: i.unit as any,
// //             qty: i.qty,
// //             pricePerUnit: i.price
// //           }))
// //         }
// //       }
// //     });
// //   }

// //   const text = [
// //     "Order from BB Fireworks, Nilganj",
// //     ...items.map(i => `${i.name} - ${i.qty} ${i.unit} @ ₹${i.price}/unit = ₹${i.total}`),
// //     `Name: ${name}`,
// //     `Phone: ${phone}`,
// //     `Address: ${address || 'Pickup'}`
// //   ].join("\n");

// //   const num = process.env.WHATSAPP_NUMBER || "9830463926";
// //   const wa = `https://wa.me/91${num}?text=${encodeURIComponent(text)}`;
// //   redirect(wa);
// // }

// // export default function Checkout() {
// //   const demo = [{ productId:"", name:"Sample", unit:"pack", qty:1, price:100, total:100 }];
// //   return (
// //     <form action={createOrder} className="space-y-3">
// //       <input name="items" type="hidden" value={JSON.stringify(demo)} />
// //       <div className="grid sm:grid-cols-2 gap-3">
// //         <input className="input" name="name" placeholder="Your Name" required />
// //         <input className="input" name="phone" placeholder="Phone" required />
// //         <textarea className="input" name="address" placeholder="Address (optional)" />
// //       </div>
// //       <button className="btn">Send order on WhatsApp</button>
// //     </form>
// //   );
// // }

// import { prisma } from "@/lib/prisma";
// import { redirect } from "next/navigation";

// type ItemIn = { productId: string; name: string; unit: "box"|"pack"|"piece"; qty: number };

// async function createOrder(formData: FormData) {
//   "use server";

//   const name = String(formData.get("name") || "");
//   const phone = String(formData.get("phone") || "");
//   const address = String(formData.get("address") || "");
//   const raw = String(formData.get("items") || "[]");

//   let items: ItemIn[] = [];
//   try { items = JSON.parse(raw) as ItemIn[]; } catch {}

//   if (!items.length) {
//     // Nothing to order; just return to cart
//     redirect("/cart");
//   }

//   // Price from latest active marketplace PriceList (server-authoritative)
//   const now = new Date();

//   const lines = [];
//   for (const it of items) {
//     const product = await prisma.product.findUnique({
//       where: { id: it.productId },
//       select: { id: true, name: true },
//     });
//     if (!product) continue;

//     const price = await prisma.priceList.findFirst({
//       where: {
//         productId: product.id,
//         channel: "marketplace",
//         activeFrom: { lte: now },
//         OR: [{ activeTo: null }, { activeTo: { gte: now } }],
//       },
//       orderBy: { activeFrom: "desc" },
//       select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
//     });

//     let pricePerUnit: number | null = null;
//     if (it.unit === "box") pricePerUnit = price?.sellPerBox ? Number(price.sellPerBox) : null;
//     if (it.unit === "pack") pricePerUnit = price?.sellPerPack ? Number(price.sellPerPack) : null;
//     if (it.unit === "piece") pricePerUnit = price?.sellPerPiece ? Number(price.sellPerPiece) : null;

//     if (pricePerUnit == null) {
//       // skip lines with no marketplace price for that unit
//       continue;
//     }

//     lines.push({
//       productId: product.id,
//       name: product.name,
//       unit: it.unit,
//       qty: Math.max(1, Number(it.qty || 1)),
//       pricePerUnit,
//     });
//   }

//   if (!lines.length) {
//     redirect("/cart");
//   }

//   // Create DB Order with pending_whatsapp status
//   await prisma.order.create({
//     data: {
//       channel: "marketplace",
//       status: "pending_whatsapp",
//       notes: `Guest checkout: ${name} / ${phone}`,
//       lines: {
//         create: lines.map((l) => ({
//           productId: l.productId,
//           unit: l.unit as any,
//           qty: l.qty,
//           pricePerUnit: l.pricePerUnit,
//         })),
//       },
//     },
//   });

//   const subtotal = lines.reduce((a, l) => a + l.qty * l.pricePerUnit, 0);
//   const text = [
//     "Order from BB Fireworks, Nilganj",
//     ...lines.map(
//       (l) =>
//         `${l.name} - ${l.qty} ${l.unit} @ ₹${l.pricePerUnit.toFixed(2)}/unit = ₹${(l.qty * l.pricePerUnit).toFixed(2)}`
//     ),
//     `Subtotal: ₹${subtotal.toFixed(2)}`,
//     `Name: ${name}`,
//     `Phone: ${phone}`,
//     `Address: ${address || "Pickup"}`,
//   ].join("\n");

//   const num = process.env.WHATSAPP_NUMBER || "9830463926";
//   const wa = `https://wa.me/91${num}?text=${encodeURIComponent(text)}`;
//   redirect(wa);
// }

// export default function Checkout() {
//   return (
//     <form action={createOrder} className="space-y-3">
//       {/* Hidden items field is filled client-side from localStorage */}
//       <input name="items" id="items" type="hidden" defaultValue="[]" />
//       <div className="grid sm:grid-cols-2 gap-3">
//         <input className="input" name="name" placeholder="Your Name" required />
//         <input className="input" name="phone" placeholder="Phone" required />
//         <textarea className="input" name="address" placeholder="Address (optional)" />
//       </div>
//       <ClientHydrator />
//       <button className="btn">Send order on WhatsApp</button>
//     </form>
//   );
// }

// /** Writes localStorage cart into the hidden "items" input on mount */
// function ClientHydrator() {
//   return (
//     <script
//       dangerouslySetInnerHTML={{
//         __html: `
// (function(){
//   try {
//     var raw = localStorage.getItem("bbf_cart") || "[]";
//     var el = document.getElementById("items");
//     if (el) el.value = raw;
//   } catch (e) {}
// })();
// `,
//       }}
//     />
//   );
// }

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toPieces } from "@/lib/units";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import React from "react";

type CartItem = {
  productId: string;
  name: string;
  unit: "box" | "pack" | "piece";
  qty: number;
};

type ProductWithPrice = {
  id: string;
  name: string;
  piecesPerPack: number;
  packsPerBox: number;
  prices: Array<{
    sellPerBox: number | null;
    sellPerPack: number | null;
    sellPerPiece: number | null;
  }>;
};

async function createOrder(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const address = String(formData.get("address") || "");
  const note = String(formData.get("note") || "");

  // Changed: Use "items" to match the existing cart localStorage key
  const raw = String(formData.get("items") || "[]");

  let items: CartItem[] = [];
  try {
    items = JSON.parse(raw) as CartItem[];
  } catch {}

  if (!items.length) {
    redirect("/cart");
  }

  // Load products & current marketplace prices
  const ids = [...new Set(items.map((r) => r.productId))];
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      piecesPerPack: true,
      packsPerBox: true,
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
  const pmap = new Map<string, ProductWithPrice>(products.map((p: ProductWithPrice) => [p.id, p]));

  // Stock validation
  const grouped = await prisma.stockLedger.groupBy({
    by: ["productId"],
    _sum: { deltaPieces: true },
    where: { productId: { in: ids } },
  });
  const stock: Record<string, number> = {};
  for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

  for (const item of items) {
    const p = pmap.get(item.productId);
    if (!p) throw new Error(`Product ${item.name} not found`);
    const need = toPieces(item.qty, item.unit, p.piecesPerPack, p.packsPerBox);
    if ((stock[item.productId] ?? 0) < need) {
      throw new Error(`${item.name} is out of stock`);
    }
    stock[item.productId] = (stock[item.productId] ?? 0) - need;
  }

  // Create or upsert customer
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { name, address },
    create: { name, phone, address },
    select: { id: true },
  });

  // Create Order with marketplace channel + pending_whatsapp
  const order = await prisma.order.create({
    data: {
      channel: "marketplace",
      status: "pending_whatsapp",
      customerId: customer.id,
      notes: note || `Guest checkout: ${name} / ${phone}`,
      lines: {
        create: items.map((item) => {
          const p = pmap.get(item.productId)!;
          const pr = p.prices[0];
          const pricePerUnit =
            item.unit === "box"
              ? pr?.sellPerBox ?? 0
              : item.unit === "pack"
              ? pr?.sellPerPack ?? 0
              : pr?.sellPerPiece ?? 0;
          return {
            productId: item.productId,
            unit: item.unit,
            qty: item.qty,
            pricePerUnit: Number(pricePerUnit), // Fixed: Convert to number, not string
          };
        }),
      },
    },
    select: { id: true },
  });

  // Deduct stock via StockLedger entries
  for (const item of items) {
    const p = pmap.get(item.productId)!;
    const pr = p.prices[0];
    const pricePerUnit =
      item.unit === "box"
        ? pr?.sellPerBox ?? 0
        : item.unit === "pack"
        ? pr?.sellPerPack ?? 0
        : pr?.sellPerPiece ?? 0;
    const deltaPieces = -toPieces(item.qty, item.unit, p.piecesPerPack, p.packsPerBox);

    await prisma.stockLedger.create({
      data: {
        productId: item.productId,
        deltaPieces,
        unitCostPiece: Number(pricePerUnit), // Use sell price as cost for now
        sourceType: "sale",
        sourceId: order.id,
      },
    });
  }

  // Build WhatsApp text
  const lines = items.map((item) => {
    const p = pmap.get(item.productId)!;
    const pr = p.prices[0];
    const price =
      item.unit === "box"
        ? pr?.sellPerBox ?? 0
        : item.unit === "pack"
        ? pr?.sellPerPack ?? 0
        : pr?.sellPerPiece ?? 0;
    const total = Number(price) * item.qty;
    return `${item.name} - ${item.qty} ${item.unit} @ ₹${Number(price).toFixed(2)}/unit = ₹${total.toFixed(2)}`;
  });

  const subtotal = items.reduce((sum, item) => {
    const p = pmap.get(item.productId)!;
    const pr = p.prices[0];
    const price =
      item.unit === "box"
        ? pr?.sellPerBox ?? 0
        : item.unit === "pack"
        ? pr?.sellPerPack ?? 0
        : pr?.sellPerPiece ?? 0;
    return sum + Number(price) * item.qty;
  }, 0);

  const text = [
    `Order from BB Fireworks, Nilganj`,
    ...lines,
    `Subtotal: ₹${subtotal.toFixed(2)}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address || "Pickup"}`,
    note ? `Note: ${note}` : null,
    `OrderId: ${order.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  const waNumber = process.env.WHATSAPP_NUMBER || "9830463926";
  const wa = buildWhatsAppLink(waNumber, text);
  redirect(wa);
}

export default function CheckoutPage() {
  return (
    <form action={createOrder} className="space-y-3">
      <CartToHidden />
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="input" name="name" placeholder="Your name" required />
        <input className="input" name="phone" placeholder="Phone" required />
        <textarea
          className="input sm:col-span-2"
          name="address"
          placeholder="Address (optional)"
        />
        <textarea
          className="input sm:col-span-2"
          name="note"
          placeholder="Notes (optional)"
        />
      </div>
      <button className="btn">Send on WhatsApp</button>
    </form>
  );
}

/** Collect cart from localStorage at mount time - uses "bbf_cart" key */
function CartToHidden() {
  "use client";
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const payload = JSON.parse(localStorage.getItem("bbf_cart") || "[]");
    if (ref.current) ref.current.value = JSON.stringify(payload);
  }, []);
  // Changed: Use "items" to match old field name
  return <input ref={ref} name="items" type="hidden" defaultValue="[]" />;
}
