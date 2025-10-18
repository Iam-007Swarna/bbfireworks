/**
 * Inventory Cache System
 *
 * Caches product inventory (stock levels) in memory to reduce database calls.
 * Updates daily and provides stock information in box/pack/piece format.
 */

import { prisma } from "@/lib/prisma";

export type InventoryData = {
  productId: string;
  productName: string;
  piecesPerPack: number;
  packsPerBox: number;
  totalPieces: number;
  availableBoxes: number;
  availablePacks: number;
  availablePieces: number;
  lastUpdated: Date;
};

type CacheEntry = {
  data: Map<string, InventoryData>;
  lastRefresh: Date;
};

// In-memory cache
let inventoryCache: CacheEntry | null = null;

// Cache TTL: 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Mutex to prevent concurrent cache refreshes
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Calculate box/pack/piece breakdown from total pieces
 */
function calculateUnits(
  totalPieces: number,
  piecesPerPack: number,
  packsPerBox: number
): {
  boxes: number;
  packs: number;
  pieces: number;
} {
  const piecesPerBoxTotal = piecesPerPack * packsPerBox;

  const boxes = Math.floor(totalPieces / piecesPerBoxTotal);
  let remaining = totalPieces % piecesPerBoxTotal;

  const packs = Math.floor(remaining / piecesPerPack);
  remaining = remaining % piecesPerPack;

  const pieces = remaining;

  return { boxes, packs, pieces };
}

/**
 * Check if cache is stale (older than 24 hours)
 */
function isCacheStale(): boolean {
  if (!inventoryCache) return true;
  const now = new Date();
  const timeSinceRefresh = now.getTime() - inventoryCache.lastRefresh.getTime();
  return timeSinceRefresh > CACHE_TTL;
}

/**
 * Refresh the inventory cache from database
 * Protected with mutex to prevent concurrent refreshes
 */
export async function refreshInventoryCache(): Promise<void> {
  // If already refreshing, wait for that refresh to complete
  if (isRefreshing && refreshPromise) {
    console.log("[InventoryCache] Refresh already in progress, waiting...");
    await refreshPromise;
    return;
  }

  // Set the refreshing flag and create the promise
  isRefreshing = true;
  refreshPromise = (async () => {
    console.log("[InventoryCache] Refreshing inventory cache...");
    const startTime = Date.now();

    try {
      // Fetch all active products with their stock data
      const products = await prisma.product.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          piecesPerPack: true,
          packsPerBox: true,
        },
      });

      // Get stock levels for all products in one query
      const stockData = await prisma.stockLedger.groupBy({
        by: ["productId"],
        _sum: { deltaPieces: true },
        where: {
          productId: { in: products.map((p) => p.id) },
        },
      });

      // Build stock map
      const stockMap = new Map<string, number>();
      for (const entry of stockData) {
        stockMap.set(entry.productId, entry._sum.deltaPieces ?? 0);
      }

      // Build inventory data
      const inventoryMap = new Map<string, InventoryData>();
      const now = new Date();

      for (const product of products) {
        const totalPieces = stockMap.get(product.id) ?? 0;
        const units = calculateUnits(
          totalPieces,
          product.piecesPerPack,
          product.packsPerBox
        );

        inventoryMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          piecesPerPack: product.piecesPerPack,
          packsPerBox: product.packsPerBox,
          totalPieces,
          availableBoxes: units.boxes,
          availablePacks: units.packs,
          availablePieces: units.pieces,
          lastUpdated: now,
        });
      }

      // Update cache
      inventoryCache = {
        data: inventoryMap,
        lastRefresh: now,
      };

      const duration = Date.now() - startTime;
      console.log(
        `[InventoryCache] Cache refreshed successfully in ${duration}ms. ` +
        `${inventoryMap.size} products cached.`
      );
    } catch (error) {
      console.error("[InventoryCache] Failed to refresh cache:", error);
      throw error;
    } finally {
      // Reset the mutex
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  await refreshPromise;
}

/**
 * Get inventory data for a single product
 */
export async function getInventory(productId: string): Promise<InventoryData | null> {
  // Refresh cache if stale
  if (isCacheStale()) {
    await refreshInventoryCache();
  }

  return inventoryCache?.data.get(productId) ?? null;
}

/**
 * Get inventory data for multiple products
 */
export async function getInventoryMap(
  productIds: string[]
): Promise<Map<string, InventoryData>> {
  // Refresh cache if stale
  if (isCacheStale()) {
    await refreshInventoryCache();
  }

  const result = new Map<string, InventoryData>();

  for (const id of productIds) {
    const data = inventoryCache?.data.get(id);
    if (data) {
      result.set(id, data);
    }
  }

  return result;
}

/**
 * Get all cached inventory data
 */
export async function getAllInventory(): Promise<Map<string, InventoryData>> {
  // Refresh cache if stale
  if (isCacheStale()) {
    await refreshInventoryCache();
  }

  return new Map(inventoryCache?.data ?? new Map());
}

/**
 * Check if a product has sufficient stock
 */
export async function hasStock(
  productId: string,
  quantity: number,
  unit: "box" | "pack" | "piece"
): Promise<boolean> {
  const inventory = await getInventory(productId);
  if (!inventory) return false;

  const { totalPieces, piecesPerPack, packsPerBox } = inventory;

  let requiredPieces = 0;
  if (unit === "piece") {
    requiredPieces = quantity;
  } else if (unit === "pack") {
    requiredPieces = quantity * piecesPerPack;
  } else {
    // box
    requiredPieces = quantity * piecesPerPack * packsPerBox;
  }

  return totalPieces >= requiredPieces;
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getCacheStats(): {
  isCached: boolean;
  lastRefresh: Date | null;
  cacheAge: number | null;
  productCount: number;
  isStale: boolean;
} {
  return {
    isCached: inventoryCache !== null,
    lastRefresh: inventoryCache?.lastRefresh ?? null,
    cacheAge: inventoryCache
      ? Date.now() - inventoryCache.lastRefresh.getTime()
      : null,
    productCount: inventoryCache?.data.size ?? 0,
    isStale: isCacheStale(),
  };
}

/**
 * Force clear the cache (useful for testing or manual refresh)
 */
export function clearInventoryCache(): void {
  inventoryCache = null;
  console.log("[InventoryCache] Cache cleared");
}

/**
 * Initialize cache on server startup
 */
export async function initializeInventoryCache(): Promise<void> {
  console.log("[InventoryCache] Initializing cache on startup...");
  await refreshInventoryCache();
}
