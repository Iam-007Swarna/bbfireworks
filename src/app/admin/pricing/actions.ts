"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Helpers
function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type PriceInput = {
  productId: string;
  channel: "marketplace" | "retail";
  sellPerBox?: number | null;
  sellPerPack?: number | null;
  sellPerPiece?: number | null;
};

/** Close current active price and create a new active record atomically. */
async function upsertActivePrice({
  productId,
  channel,
  sellPerBox,
  sellPerPack,
  sellPerPiece,
}: PriceInput) {
  const now = new Date();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.priceList.updateMany({
      where: {
        productId,
        channel,
        activeFrom: { lte: now },
        OR: [{ activeTo: null }, { activeTo: { gt: now } }],
      },
      data: { activeTo: now },
    });

    await tx.priceList.create({
      data: {
        productId,
        channel,
        // If your Prisma schema uses Decimal, wrap with new Prisma.Decimal(...)
        sellPerBox: sellPerBox ?? null,
        sellPerPack: sellPerPack ?? null,
        sellPerPiece: sellPerPiece ?? null,
        activeFrom: now,
      },
    });
  });
}

export async function saveRow(formData: FormData) {
  const productId = String(formData.get("productId") || "");

  if (!productId) return;

  const marketBox = numOrNull(formData.get("mk_box"));
  const marketPack = numOrNull(formData.get("mk_pack"));
  const marketPiece = numOrNull(formData.get("mk_piece"));
  const retailBox = numOrNull(formData.get("rt_box"));
  const retailPack = numOrNull(formData.get("rt_pack"));
  const retailPiece = numOrNull(formData.get("rt_piece"));

  await upsertActivePrice({
    productId,
    channel: "marketplace",
    sellPerBox: marketBox,
    sellPerPack: marketPack,
    sellPerPiece: marketPiece,
  });

  await upsertActivePrice({
    productId,
    channel: "retail",
    sellPerBox: retailBox,
    sellPerPack: retailPack,
    sellPerPiece: retailPiece,
  });

  revalidatePath("/admin/pricing");
}
