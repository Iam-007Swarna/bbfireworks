import { prisma } from "@/lib/prisma";

/**
 * Weighted average cost per piece using purchase ledger rows.
 * If a manual cost adjustment exists (sourceType: "adjust"), it takes precedence.
 * Good for margin preview; not a strict FIFO COGS.
 * Returns null if no purchase history.
 */
export async function avgCostPiece(productId: string): Promise<number | null> {
  // Check for the most recent manual cost adjustment first
  const manualAdjustment = await prisma.stockLedger.findFirst({
    where: { productId, sourceType: "adjust" },
    orderBy: { createdAt: "desc" },
    select: { unitCostPiece: true },
  });

  // If there's a manual adjustment, use it
  if (manualAdjustment) {
    return Number(manualAdjustment.unitCostPiece);
  }

  // Otherwise, calculate weighted average from purchases
  const rows = await prisma.stockLedger.findMany({
    where: { productId, deltaPieces: { gt: 0 }, sourceType: "purchase" },
    select: { deltaPieces: true, unitCostPiece: true },
  });
  if (!rows.length) return null;
  let pieces = 0;
  let value = 0;
  for (const r of rows) {
    const p = r.deltaPieces;
    const c = Number(r.unitCostPiece);
    pieces += p;
    value += p * c;
  }
  if (pieces <= 0) return null;
  return value / pieces;
}
