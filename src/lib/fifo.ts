import { prisma } from "@/lib/prisma";
import { toPieces, Unit } from "./units";

/**
 * Consume stock FIFO-style for a single product and create a -StockLedger row.
 * Returns the avg cost per piece used for this consumption.
 * Note: first-cut approach; good enough for initial COGS and profit lines.
 */
export async function consumeFIFOOnce(
  productId: string,
  qty: number,
  unit: Unit,
  piecesPerPack: number,
  packsPerBox: number,
  sourceId: string
) {
  const needPieces = toPieces(qty, unit, piecesPerPack, packsPerBox);
  if (needPieces <= 0) throw new Error("Invalid quantity");

  // Oldest purchase layers
  const layers = await prisma.stockLedger.findMany({
    where: { productId, deltaPieces: { gt: 0 }, sourceType: "purchase" },
    orderBy: { createdAt: "asc" },
    select: { id: true, deltaPieces: true, unitCostPiece: true },
  });

  // Compute total available (fast check)
  const total = await prisma.stockLedger.aggregate({
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
  await prisma.stockLedger.create({
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
