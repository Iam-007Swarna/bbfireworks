import { getAllInventory, getCacheStats, refreshInventoryCache } from "@/lib/inventoryCache";
import { Package, Database, Clock } from "lucide-react";
import Link from "next/link";
import { RefreshCacheButton } from "./RefreshCacheButton";
import { CacheRefreshTimer } from "@/components/inventory/CacheRefreshTimer";
import { revalidatePath } from "next/cache";
import { formatDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";

// Server Action for refreshing cache
async function refreshCacheAction() {
  "use server";

  console.log("[InventoryCache] Manual refresh triggered...");

  // Refresh the cache
  await refreshInventoryCache();

  // Revalidate all pages that display stock information
  // Using layout type to revalidate all nested pages
  revalidatePath("/admin/inventory", "layout");
  revalidatePath("/products", "layout"); // This will revalidate all product pages
  revalidatePath("/(public)/products", "layout"); // Also revalidate the public route group
  revalidatePath("/", "layout"); // Revalidate home page and all nested pages

  console.log("[InventoryCache] Manual refresh complete, paths revalidated");
}

export default async function InventoryPage() {
  const cacheStats = getCacheStats();
  const inventory = await getAllInventory();
  const inventoryArray = Array.from(inventory.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );

  const outOfStock = inventoryArray.filter((item) => item.totalPieces === 0).length;
  const inStock = inventoryArray.length - outOfStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Inventory Overview</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <CacheRefreshTimer
            lastRefresh={cacheStats.lastRefresh}
            cacheTTL={15 * 60 * 1000}
          />
          <RefreshCacheButton refreshAction={refreshCacheAction} />
          <Link href="/admin/purchases/new" className="btn bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
            + Receive Stock
          </Link>
        </div>
      </div>

      {/* Cache Stats Card */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-lg font-semibold">Cache Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
            <div className="font-semibold mt-1">
              {cacheStats.isCached ? (
                <span className="text-green-600 dark:text-green-400">✓ Active</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">✗ Not Initialized</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Products Cached</div>
            <div className="font-semibold mt-1 text-xl">{cacheStats.productCount}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Clock size={14} />
              Last Refresh
            </div>
            <div className="font-semibold mt-1 text-sm">
              {cacheStats.lastRefresh
                ? formatDateTime(cacheStats.lastRefresh)
                : "Never"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cache Age</div>
            <div className="font-semibold mt-1">
              {cacheStats.cacheAge
                ? `${Math.floor(cacheStats.cacheAge / 1000 / 60)} min`
                : "N/A"}
            </div>
          </div>
        </div>

        {cacheStats.isStale && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Cache is stale (older than 15 minutes). Consider refreshing for accurate data.
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
          <div className="text-2xl font-bold mt-1">{inventoryArray.length}</div>
        </div>

        <div className="card p-4 bg-green-50 dark:bg-green-900/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">In Stock</div>
          <div className="text-2xl font-bold mt-1 text-green-700 dark:text-green-400">
            {inStock}
          </div>
        </div>

        <div className="card p-4 bg-red-50 dark:bg-red-900/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</div>
          <div className="text-2xl font-bold mt-1 text-red-700 dark:text-red-400">
            {outOfStock}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package size={20} />
          Current Stock Levels
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr className="text-left">
                <th className="p-3">Product</th>
                <th className="p-3 text-right">Boxes Available</th>
                <th className="p-3 text-right">Packs Available</th>
                <th className="p-3 text-right">Pieces Available</th>
                <th className="p-3 text-right">Total (pieces)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {inventoryArray.map((item) => {
                const hasStock = item.totalPieces > 0;

                return (
                  <tr
                    key={item.productId}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                      !hasStock ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-3 font-medium">{item.productName}</td>
                    <td className="p-3 text-right">
                      {item.availableBoxes > 0 ? (
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {item.availableBoxes}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.availablePacks > 0 ? (
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {item.availablePacks}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.availablePieces > 0 ? (
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {item.availablePieces}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono text-gray-600 dark:text-gray-400">
                        {item.totalPieces.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3">
                      {hasStock ? (
                        <span className="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          In Stock
                        </span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/products/${item.productId}`}
                        className="text-blue-600 hover:underline dark:text-blue-400 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {inventoryArray.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found. Click &quot;Refresh Cache&quot; to load inventory data.
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="card p-4 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>📊 Cache System:</strong> Inventory data is cached in memory and refreshes automatically every 15
          minutes to minimize database load. Use &quot;Refresh Cache&quot; to manually update after stock changes.
        </p>
      </div>
    </div>
  );
}
