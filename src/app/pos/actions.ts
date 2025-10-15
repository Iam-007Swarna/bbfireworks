"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toPieces, Unit } from "@/lib/units";
import { consumeFIFOOnce } from "@/lib/fifo";
import { nextInvoiceNumberTx } from "./helpers";
import type { Prisma } from "@prisma/client";

/** Server: fetch active products + active retail price */
export async function productsForPOS() {
  const now = new Date();

  const products = await prisma.product.findMany({
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
      prices: {
        where: {
          channel: "retail",
          activeFrom: { lte: now },
          OR: [{ activeTo: null }, { activeTo: { gte: now } }],
        },
        orderBy: { activeFrom: "desc" },
        take: 1,
        select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Explicitly type the products array to fix map errors
  type ProductWithPrice = typeof products[number];

  // Current stock map
  const grouped = await prisma.stockLedger.groupBy({
    by: ["productId"],
    _sum: { deltaPieces: true },
    where: { productId: { in: products.map((p: ProductWithPrice) => p.id) } },
  });
  const stock: Record<string, number> = {};
  for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

  return products.map((p: ProductWithPrice) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    piecesPerPack: p.piecesPerPack,
    packsPerBox: p.packsPerBox,
    allow: { box: p.allowSellBox, pack: p.allowSellPack, piece: p.allowSellPiece },
    price: {
      box: p.prices[0]?.sellPerBox != null ? Number(p.prices[0].sellPerBox) : null,
      pack: p.prices[0]?.sellPerPack != null ? Number(p.prices[0].sellPerPack) : null,
      piece: p.prices[0]?.sellPerPiece != null ? Number(p.prices[0].sellPerPiece) : null,
    },
    stockPieces: stock[p.id] ?? 0,
  }));
}

/** Validate incoming cart lines */
const lineSchema = z.object({
  productId: z.string().min(1),
  unit: z.enum(["box", "pack", "piece"]),
  qty: z.number().positive(),
  pricePerUnit: z.number().min(0),
});
const linesSchema = z.array(lineSchema).min(1);

/** Finalize POS invoice atomically (order + FIFO consumption + invoice) */
export async function finalizePOS(formData: FormData) {
  "use server";

  const raw = String(formData.get("lines") || "[]");
  const cashierId = String(formData.get("cashierId") || "") || null;

  let lines: z.infer<typeof linesSchema>;
  try {
    lines = linesSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error("Invalid cart");
  }

  // Load product data and allow flags
  const ids = [...new Set(lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      piecesPerPack: true,
      packsPerBox: true,
      allowSellBox: true,
      allowSellPack: true,
      allowSellPiece: true,
    },
  });
  
  // Explicitly type the Map to fix TypeScript errors
  type ProductInfo = typeof products[number];
  const pmap = new Map<string, ProductInfo>(
    products.map((p: ProductInfo) => [p.id, p])
  );
  
  if (pmap.size !== ids.length) throw new Error("One or more products not found");

  // Quick pre-check for stock and allowed unit (best-effort; final check in tx)
  const grouped = await prisma.stockLedger.groupBy({
    by: ["productId"],
    _sum: { deltaPieces: true },
    where: { productId: { in: ids } },
  });
  const stock: Record<string, number> = {};
  for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

  for (const l of lines) {
    const p = pmap.get(l.productId)!;
    const allowed =
      l.unit === "box" ? p.allowSellBox : l.unit === "pack" ? p.allowSellPack : p.allowSellPiece;
    if (!allowed) throw new Error("Unit not sellable for a product");

    const need = toPieces(l.qty, l.unit as Unit, p.piecesPerPack, p.packsPerBox);
    if ((stock[l.productId] ?? 0) < need) throw new Error("Insufficient stock for one or more items");
    stock[l.productId] = (stock[l.productId] ?? 0) - need; // reserve locally
  }

  // All-or-nothing
  let invoiceId = "";
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.create({
      data: {
        channel: "retail",
        status: "fulfilled",
        createdById: cashierId,
        notes: "POS sale",
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            unit: l.unit,
            qty: l.qty,
            pricePerUnit: l.pricePerUnit,
          })),
        },
      },
      select: { id: true },
    });

    let subtotal = 0;
    for (const l of lines) {
      const p = pmap.get(l.productId)!;
      // consumeFIFOOnce consumes stock and records FIFO cost
      const { needPieces } = await consumeFIFOOnce(
        l.productId,
        l.qty,
        l.unit as Unit,
        p.piecesPerPack,
        p.packsPerBox,
        order.id // sourceId is the order ID
      );
      if (!Number.isFinite(needPieces) || needPieces <= 0) throw new Error("FIFO consumption failed");
      subtotal += l.qty * l.pricePerUnit;
    }

    // Create invoice with race-safe number (requires @unique on Invoice.number)
    let number = await nextInvoiceNumberTx(tx);
    try {
      const created = await tx.invoice.create({
        data: {
          orderId: order.id,
          number,
          subtotal: String(subtotal),
          tax: "0",
          roundOff: "0",
          grand: String(subtotal),
          pdfBytes: Buffer.from(""), // PDF to be generated later
        },
      });
      invoiceId = created.id;
    } catch (e: any) {
      if (e?.code === "P2002") {
        number = await nextInvoiceNumberTx(tx);
        const created = await tx.invoice.create({
          data: {
            orderId: order.id,
            number,
            subtotal: String(subtotal),
            tax: "0",
            roundOff: "0",
            grand: String(subtotal),
            pdfBytes: Buffer.from(""),
          },
        });
        invoiceId = created.id;
      } else {
        throw e;
      }
    }
  });

  // Generate PDF now
  const buf = await (await import("@/lib/pdf")).generateInvoicePdfBuffer(invoiceId);
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { pdfBytes: buf, pdfMime: "application/pdf" },
  });

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

/** Type the item the client consumes */
export type POSItem = Awaited<ReturnType<typeof productsForPOS>>[number];