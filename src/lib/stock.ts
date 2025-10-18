import { prisma } from "@/lib/prisma";
import { getInventory, getInventoryMap } from "@/lib/inventoryCache";

/** Sum current stock (pieces) for a single product - now uses cache */
export async function inStockPieces(productId: string) {
  const inventory = await getInventory(productId);
  return inventory?.totalPieces ?? 0;
}

/** Map productId -> pieces in stock for a list of product ids - now uses cache */
export async function stockMap(productIds: string[]) {
  if (productIds.length === 0) return {} as Record<string, number>;

  const inventoryMap = await getInventoryMap(productIds);
  const map: Record<string, number> = {};

  for (const [id, inventory] of inventoryMap) {
    map[id] = inventory.totalPieces;
  }

  // ensure missing ids show as 0
  for (const id of productIds) {
    if (!(id in map)) map[id] = 0;
  }

  return map;
}

/**
 * LEGACY: Direct database query without cache
 * Use this only when you need real-time stock data (e.g., critical operations)
 */
export async function inStockPiecesDirectDB(productId: string) {
  const res = await prisma.stockLedger.aggregate({
    _sum: { deltaPieces: true },
    where: { productId },
  });
  return res._sum.deltaPieces ?? 0;
}

/**
 * LEGACY: Direct database query without cache
 * Use this only when you need real-time stock data
 */
export async function stockMapDirectDB(productIds: string[]) {
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
