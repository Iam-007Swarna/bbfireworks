import { prisma } from "@/lib/prisma";

/**
 * Weighted average cost per piece using ONLY purchase (+) ledger rows.
 * Good for margin preview; not a strict FIFO COGS.
 * Returns null if no purchase history.
 */
export async function avgCostPiece(productId: string): Promise<number | null> {
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
