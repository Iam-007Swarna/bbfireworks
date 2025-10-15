"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { verify as verifyPassword } from "@/lib/auth/hash";
import { auth } from "@/auth.config";

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

export async function verifyPasswordForCostEdit(formData: FormData) {
  const password = String(formData.get("password") || "");

  // Get current user from NextAuth session
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Fetch user and verify password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { passwordHash: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (isValid) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid password" };
    }
  } catch {
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Save a manual cost adjustment by creating a stock ledger entry.
 * This allows overriding the weighted average cost calculation.
 */
export async function saveCost(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const costPerPiece = numOrNull(formData.get("costPerPiece"));

  if (!productId || costPerPiece === null || costPerPiece < 0) {
    return { success: false, error: "Invalid input" };
  }

  // Get current user from NextAuth session
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Create a stock ledger adjustment entry with zero delta
    // This records the new cost without changing inventory
    await prisma.stockLedger.create({
      data: {
        productId,
        deltaPieces: 0,
        unitCostPiece: costPerPiece,
        sourceType: "adjust",
        sourceId: `cost-override-${Date.now()}`,
      },
    });

    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    console.error("Failed to save cost:", error);
    return { success: false, error: "Failed to save cost" };
  }
}
