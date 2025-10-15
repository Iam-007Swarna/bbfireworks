import { prisma } from "@/lib/prisma";

/** Sum current stock (pieces) for a single product */
export async function inStockPieces(productId: string) {
  const res = await prisma.stockLedger.aggregate({
    _sum: { deltaPieces: true },
    where: { productId },
  });
  return res._sum.deltaPieces ?? 0;
}

/** Map productId -> pieces in stock for a list of product ids (1 query via groupBy) */
export async function stockMap(productIds: string[]) {
  if (productIds.length === 0) return {} as Record<string, number>;
  const grouped = await prisma.stockLedger.groupBy({
    by: ["productId"],
    _sum: { deltaPieces: true },
    where: { productId: { in: productIds } },
  });
  const map: Record<string, number> = {};
  for (const g of grouped) map[g.productId] = g._sum.deltaPieces ?? 0;
  // ensure missing ids show as 0
  for (const id of productIds) if (!(id in map)) map[id] = 0;
  return map;
}
