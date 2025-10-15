import { prisma } from "@/lib/prisma";
import { toPieces, Unit } from "./units";
import type { Prisma } from "@prisma/client";

/**
 * Consume stock FIFO-style for a single product and create a -StockLedger row.
 * Returns the avg cost per piece used for this consumption.
 * Note: first-cut approach; good enough for initial COGS and profit lines.
 *
 * @param tx - Optional transaction client. If provided, all operations use this transaction.
 */
export async function consumeFIFOOnce(
  productId: string,
  qty: number,
  unit: Unit,
  piecesPerPack: number,
  packsPerBox: number,
  sourceId: string,
  tx?: Prisma.TransactionClient
) {
  // Use transaction client if provided, otherwise use global prisma
  const db = tx ?? prisma;

  const needPieces = toPieces(qty, unit, piecesPerPack, packsPerBox);
  if (needPieces <= 0) throw new Error("Invalid quantity");

  // Oldest purchase layers
  const layers = await db.stockLedger.findMany({
    where: { productId, deltaPieces: { gt: 0 }, sourceType: "purchase" },
    orderBy: { createdAt: "asc" },
    select: { id: true, deltaPieces: true, unitCostPiece: true },
  });

  // Compute total available (fast check)
  const total = await db.stockLedger.aggregate({
    _sum: { deltaPieces: true },
    where: { productId },
  });
  const available = total._sum.deltaPieces ?? 0;
  if (available < needPieces) throw new Error("Insufficient stock");

  // Naive layer consumption for average cost figure
  let remaining = needPieces;
  let costValue = 0;
  for (const l of layers) {
    const take = Math.min(remaining, l.deltaPieces);
    if (take > 0) {
      costValue += take * Number(l.unitCostPiece);
      remaining -= take;
    }
    if (!remaining) break;
  }
  const avgCostPiece = costValue / needPieces;

  // Record sale row (negative pieces) with computed avg cost
  await db.stockLedger.create({
    data: {
      productId,
      deltaPieces: -needPieces,
      unitCostPiece: String(avgCostPiece),
      sourceType: "sale",
      sourceId,
    },
  });

  return { needPieces, avgCostPiece };
}
