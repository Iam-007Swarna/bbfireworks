"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { refreshInventoryCache } from "@/lib/inventoryCache";

type LineIn = {
  productId: string;
  qtyBoxes: number;
  qtyPacks: number;
  qtyPieces: number;
  unitCostPiece: number; // ₹ per piece (normalized)
  taxPct?: number;
};

function parseLocalDateYYYYMMDD(d: string) {
  // Avoid UTC parsing drift for <input type="date">
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) throw new Error("Invalid date");
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  return new Date(y, mo, day, 12, 0, 0, 0); // local noon to dodge DST edges
}

async function readAttachment(file: File | null) {
  if (!file || file.size <= 0) return { bytes: undefined as Buffer | undefined, mime: undefined as string | undefined };
  // Optional safety cap (10MB)
  if (file.size > 10 * 1024 * 1024) throw new Error("Attachment too large (max 10MB)");
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  return { bytes, mime };
}

export async function createPurchase(formData: FormData) {
  // Server Action entrypoint
  const supplierName = String(formData.get("supplierName") || "").trim();
  const dateStr = String(formData.get("date") || "");
  const billNo = String(formData.get("billNo") || "").trim();
  const rawLines = String(formData.get("lines") || "[]");
  const file = formData.get("attachment") as File | null;

  if (!supplierName || !dateStr) {
    throw new Error("Supplier and date are required");
  }

  const when = parseLocalDateYYYYMMDD(dateStr);
  const { bytes: attachment, mime: attachmentMime } = await readAttachment(file);

  let lines: LineIn[] = [];
  try {
    lines = JSON.parse(rawLines) as LineIn[];
  } catch {
    throw new Error("Lines payload is invalid JSON");
  }

  // Normalize + validate lines
  lines = lines
    .map((l) => ({
      productId: String(l.productId || "").trim(),
      qtyBoxes: Math.max(0, Math.trunc(Number(l.qtyBoxes || 0))),
      qtyPacks: Math.max(0, Math.trunc(Number(l.qtyPacks || 0))),
      qtyPieces: Math.max(0, Math.trunc(Number(l.qtyPieces || 0))),
      unitCostPiece: Number(l.unitCostPiece || 0),
      taxPct: Math.max(0, Number(l.taxPct ?? 0)),
    }))
    .filter(
      (l) =>
        l.productId &&
        (l.qtyBoxes > 0 || l.qtyPacks > 0 || l.qtyPieces > 0) &&
        isFinite(l.unitCostPiece) &&
        l.unitCostPiece > 0,
    );

  if (!lines.length) {
    throw new Error("Add at least one valid line");
  }

  // Load conversions for all products in one go
  const prodIds = Array.from(new Set(lines.map((l) => l.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: prodIds }, active: true },
    select: { id: true, piecesPerPack: true, packsPerBox: true },
  });
  const productMap = new Map<string, { id: string; piecesPerPack: number; packsPerBox: number }>(products.map((p: { id: string; piecesPerPack: number; packsPerBox: number }) => [p.id, p]));

  // Fail fast if missing products
  const missing = prodIds.filter((id) => !productMap.has(id));
  if (missing.length) {
    throw new Error(`Unknown or inactive products: ${missing.join(", ")}`);
  }

  // Upsert supplier (assumes a unique index on name)
  const supplier = await prisma.supplier.upsert({
    where: { name: supplierName },
    update: {},
    create: { name: supplierName },
  });

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        supplierId: supplier.id,
        date: when,
        billNo: billNo || null,
        attachment: attachment ? Uint8Array.from(attachment) : undefined,
        attachmentMime,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            qtyBoxes: l.qtyBoxes,
            qtyPacks: l.qtyPacks,
            qtyPieces: l.qtyPieces,
            unitCostPiece: l.unitCostPiece, // If using Prisma.Decimal, convert here
            taxPct: l.taxPct ?? 0,
          })),
        },
      },
      select: { id: true },
    });

    const stockRows = lines
      .map((l) => {
        const conv = productMap.get(l.productId)!;
        const totalPieces =
          l.qtyBoxes * conv.packsPerBox * conv.piecesPerPack +
          l.qtyPacks * conv.piecesPerPack +
          l.qtyPieces;

        if (totalPieces <= 0) return null;
        return {
          productId: l.productId,
          deltaPieces: totalPieces,
          unitCostPiece: l.unitCostPiece, // If Decimal, convert here
          sourceType: "purchase" as const,
          sourceId: purchase.id,
        };
      })
      .filter(Boolean) as {
      productId: string;
      deltaPieces: number;
      unitCostPiece: number;
      sourceType: "purchase";
      sourceId: string;
    }[];

    if (stockRows.length) {
      await tx.stockLedger.createMany({ data: stockRows });
    }
  });

  // Refresh inventory cache immediately after purchase
  console.log("[Purchase] Refreshing inventory cache after purchase...");
  await refreshInventoryCache();

  // Revalidate all pages that display stock information
  revalidatePath("/admin/inventory", "layout");
  revalidatePath("/products", "layout"); // Revalidate all product pages
  revalidatePath("/(public)/products", "layout"); // Also revalidate the public route group
  revalidatePath("/", "layout"); // Revalidate home page

  console.log("[Purchase] Cache refreshed and paths revalidated");

  redirect("/admin/inventory");
}
