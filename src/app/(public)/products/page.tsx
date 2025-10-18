import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { stockMap } from "@/lib/stock";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { ProductFilters } from "@/components/marketplace/ProductFilters";

export const runtime = "nodejs";

// Enable ISR with revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

// Metadata for products page
export const metadata = {
  title: 'All Products - Shop Premium Fireworks',
  description: 'Browse our complete collection of premium fireworks and crackers. Shop safely online or visit our showroom in Nilganj.',
  openGraph: {
    title: 'All Products | BB Fireworks, Nilganj',
    description: 'Browse our complete collection of premium fireworks and crackers.',
  },
};

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";
type StockFilter = "all" | "in-stock" | "out-of-stock";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; sort?: string; stock?: string }>
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const sortBy = (params.sort ?? "name-asc") as SortOption;
  const stockFilter = (params.stock ?? "all") as StockFilter;

  const where = {
    active: true,
    visibleOnMarketplace: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { select: { id: true }, take: 1 },
      prices: {
        where: {
          channel: "marketplace",
          activeFrom: { lte: new Date() },
          OR: [{ activeTo: null }, { activeTo: { gte: new Date() } }],
        },
        orderBy: { activeFrom: "desc" },
        take: 1,
        select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const stocks = await stockMap(products.map((p: { id: string }) => p.id));

  // Filter by stock status
  let filteredProducts = products.filter((p) => {
    const inStock = (stocks[p.id] ?? 0) > 0;
    if (stockFilter === "in-stock") return inStock;
    if (stockFilter === "out-of-stock") return !inStock;
    return true;
  });

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);

    if (sortBy === "price-asc" || sortBy === "price-desc") {
      const getPrice = (p: typeof a) => {
        const price = p.prices[0];
        return Number(price?.sellPerPack ?? price?.sellPerPiece ?? price?.sellPerBox ?? 0);
      };
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      return sortBy === "price-asc" ? priceA - priceB : priceB - priceA;
    }

    return 0;
  });

  return (
    <div className="space-y-4">
      <Suspense fallback={<SearchBarSkeleton />}>
        <SearchBar defaultValue={q} />
      </Suspense>

      {/* Filters and Sort */}
      <ProductFilters productCount={filteredProducts.length} />

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {filteredProducts.map((p) => {
          const inStock = (stocks[p.id] ?? 0) > 0;
          const stockCount = stocks[p.id] ?? 0;
          const lowStock = inStock && stockCount <= 10;
          const imgId = p.images[0]?.id;
          const price = p.prices[0];

          // Determine which price to show and label
          let displayPrice = null;
          let priceLabel = "";
          if (price?.sellPerPack) {
            displayPrice = inr.format(Number(price.sellPerPack));
            priceLabel = "/pack";
          } else if (price?.sellPerPiece) {
            displayPrice = inr.format(Number(price.sellPerPiece));
            priceLabel = "/piece";
          } else if (price?.sellPerBox) {
            displayPrice = inr.format(Number(price.sellPerBox));
            priceLabel = "/box";
          }

          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className={`card group relative transition-all hover:shadow-lg hover:scale-[1.02] ${inStock ? "" : "opacity-70"}`}
            >
              {!inStock && (
                <span className="absolute top-2 left-2 z-10 badge bg-red-100 text-red-700 dark:bg-red-600 dark:text-white font-medium">
                  Out of stock
                </span>
              )}
              {lowStock && (
                <span className="absolute top-2 right-2 z-10 badge bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-white text-xs font-medium">
                  Low stock
                </span>
              )}
              {imgId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/images/${imgId}`}
                  alt={p.name}
                  className={`w-full h-40 object-cover rounded transition-transform group-hover:scale-105 ${inStock ? "" : "grayscale"}`}
                />
              ) : (
                <div
                  className={`h-40 rounded flex items-center justify-center ${inStock ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
              <div className="mt-2">
                <div className="font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</div>
                <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                {displayPrice && (
                  <div className="text-base font-bold mt-1.5 text-green-700 dark:text-green-400">
                    {displayPrice}
                    <span className="text-xs font-normal text-gray-500 ml-1">{priceLabel}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-16 space-y-3">
            <div className="text-6xl opacity-20">🎆</div>
            <p className="text-gray-600 dark:text-gray-400">
              {q ? `No products found matching "${q}"` : "No products found"}
            </p>
            {q && (
              <Link href="/products" className="inline-block text-blue-600 hover:underline dark:text-blue-400">
                Clear search
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="relative flex-1">
        <div className="input w-full pl-10 pr-20 bg-gray-100 dark:bg-gray-800 animate-pulse">
          &nbsp;
        </div>
      </div>
    </div>
  );
}
