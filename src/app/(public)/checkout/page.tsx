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
import { Decimal } from "@prisma/client/runtime/library";
import CartToHidden from "./CartToHidden";
import SubmitButton from "./SubmitButton";

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
    sellPerBox: Decimal | null;
    sellPerPack: Decimal | null;
    sellPerPiece: Decimal | null;
  }>;
};

async function createOrder(formData: FormData) {
  "use server";

  try {
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const note = String(formData.get("note") || "").trim();

    // Validation
    if (!name || name.length < 2) {
      throw new Error("Please provide a valid name");
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      throw new Error("Please provide a valid 10-digit phone number");
    }

    // Changed: Use "items" to match the existing cart localStorage key
    const raw = String(formData.get("items") || "[]");

    let items: CartItem[] = [];
    try {
      items = JSON.parse(raw) as CartItem[];
    } catch {
      throw new Error("Invalid cart data");
    }

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
  const pmap = new Map<string, ProductWithPrice>(products.map((p) => [p.id, p]));

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

    // NOTE: Stock is NOT deducted here - it will be deducted when order is confirmed
    // This prevents stock loss if user doesn't send the WhatsApp message

    // Redirect to confirmation page instead of directly to WhatsApp
    redirect(`/checkout/confirm?orderId=${order.id}`);
  } catch (error) {
    // Next.js redirect() throws a special error to perform the redirect
    // We need to check if it's a redirect and re-throw it, otherwise handle the actual error
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    // This is an actual error, log it
    console.error("Order creation error:", error);

    // Redirect to checkout with error (in a real app, you'd show this in the UI)
    redirect("/cart?error=checkout_failed");
  }
}

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 Complete your order details below. You&apos;ll review everything before sending to WhatsApp.
        </p>
      </div>

      <form action={createOrder} className="space-y-4">
        <CartToHidden />

        <div className="card p-4 space-y-4">
          <h2 className="font-semibold">Customer Information</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                className="input"
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                className="input"
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Delivery Address <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="address"
                className="input"
                name="address"
                rows={3}
                placeholder="Enter delivery address or leave blank for store pickup"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="note" className="block text-sm font-medium mb-1">
                Special Instructions <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="note"
                className="input"
                name="note"
                rows={2}
                placeholder="Any special requests or delivery instructions"
              />
            </div>
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
