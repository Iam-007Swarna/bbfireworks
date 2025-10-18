// // // import { prisma } from "@/lib/prisma";

// // // interface Product {
// // //   id: string;
// // //   name: string;
// // //   sku: string;
// // //   images: { id: string }[];
// // // }

// // // interface ProductProps {
// // //   products: Product[];
// // // }

// // // export default async function Home() {
// // //   const products = await prisma.product.findMany({
// // //     where: { active: true, visibleOnMarketplace: true },
// // //     include: { images: { select: { id: true }, take: 1 } },
// // //     orderBy: { name: "asc" }
// // //   });

// // //   return (
// // //     <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
// // //           {products.map((p: Product) => {
// // //             const imgId: string | undefined = p.images[0]?.id;
// // //             return (
// // //               <a key={p.id} href={`/products/${p.id}`} className="card group">
// // //                 {imgId ? (
// // //                   <img src={`/api/images/${imgId}`} alt={p.name} className="w-full h-40 object-cover rounded" />
// // //                 ) : (
// // //                   <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded"/>
// // //                 )}
// // //                 <div className="mt-2">
// // //                   <div className="font-medium">{p.name}</div>
// // //                   <div className="text-xs text-gray-500">SKU: {p.sku}</div>
// // //                 </div>
// // //               </a>
// // //             );
// // //           })}
// // //         </div>
// // //   );
// // // }

// // import { prisma } from "@/lib/prisma";

// // export const runtime = "nodejs";

// // export default async function Home() {
// //   // Build the query first so we can infer its return type
// //   const q = prisma.product.findMany({
// //     where: { active: true, visibleOnMarketplace: true },
// //     include: { images: { select: { id: true }, take: 1 } },
// //     orderBy: { name: "asc" },
// //   });

// //   type Products = Awaited<typeof q>;
// //   type Product = Products[number];

// //   const products = await q;

// //   return (
// //     <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
// //       {products.map((p: Product) => {
// //         const imgId: string | undefined = p.images[0]?.id;
// //         return (
// //           <a key={p.id} href={`/products/${p.id}`} className="card group">
// //             {imgId ? (
// //               <img
// //                 src={`/api/images/${imgId}`}
// //                 alt={p.name}
// //                 className="w-full h-40 object-cover rounded"
// //                 loading="lazy"
// //               />
// //             ) : (
// //               <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded" />
// //             )}
// //             <div className="mt-2">
// //               <div className="font-medium">{p.name}</div>
// //               <div className="text-xs text-gray-500">SKU: {p.sku}</div>
// //             </div>
// //           </a>
// //         );
// //       })}
// //     </div>
// //   );
// // }

// import { prisma } from "@/lib/prisma";
// import { stockMap } from "@/lib/stock";
// import { Badge } from "@/components/ui/Badge";

// export const runtime = "nodejs";

// export default async function Home() {
//   // Build the query first so we can infer types
//   const q = prisma.product.findMany({
//     where: { active: true, visibleOnMarketplace: true },
//     include: { images: { select: { id: true }, take: 1 } },
//     orderBy: { name: "asc" },
//   });
//   type Products = Awaited<typeof q>;
//   type Product = Products[number];

//   const products = await q;

//   // Type the stocks result from the function’s return type
//   const stocks: Awaited<ReturnType<typeof stockMap>> = await stockMap(
//     products.map((p: Product) => p.id)
//   );

//   return (
//     <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
//       {products.map((p: Product) => {
//         const imgId = p.images[0]?.id;
//         const pieces = stocks[p.id] ?? 0;
//         const out = pieces <= 0;

//         return (
//           <a
//             key={p.id}
//             href={`/products/${p.id}`}
//             className="card group overflow-hidden"
//           >
//             <div className="relative">
//               {imgId ? (
//                 <img
//                   src={`/api/images/${imgId}`}
//                   alt={p.name}
//                   className={`w-full h-40 object-cover rounded ${out ? "grayscale" : ""}`}
//                   loading="lazy"
//                 />
//               ) : (
//                 <div
//                   className={`h-40 bg-gray-100 dark:bg-gray-800 rounded ${out ? "grayscale" : ""}`}
//                 />
//               )}
//               {out && (
//                 <span className="absolute top-2 left-2">
//                   <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
//                     Out of stock
//                   </Badge>
//                 </span>
//               )}
//             </div>
//             <div className="mt-2">
//               <div className="font-medium">{p.name}</div>
//               <div className="text-xs text-gray-500">SKU: {p.sku}</div>
//             </div>
//           </a>
//         );
//       })}
//     </div>
//   );
// }

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stockMap } from "@/lib/stock";
import { Filter } from "lucide-react";
import { ProductFilters } from "@/components/marketplace/ProductFilters";

export const runtime = "nodejs";

// Enable ISR with revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

// Metadata for homepage
export const metadata = {
  title: 'Shop Premium Fireworks',
  description: 'Browse our extensive collection of premium fireworks and crackers. Shop safely online or visit our showroom in Nilganj.',
  openGraph: {
    title: 'Shop Premium Fireworks | BB Fireworks, Nilganj',
    description: 'Browse our extensive collection of premium fireworks and crackers.',
  },
};

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";
type StockFilter = "all" | "in-stock" | "out-of-stock";

export default async function Home({
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
      <SearchBar defaultValue={q} />

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
              <Link href="/" className="inline-block text-blue-600 hover:underline dark:text-blue-400">
                Clear search
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form className="flex gap-2" action="/">
      <div className="relative flex-1 sm:flex-initial">
        <input
          name="q"
          className="input w-full sm:w-96 pl-10"
          placeholder="Search by name or SKU..."
          defaultValue={defaultValue}
        />
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      </div>
      <button className="btn bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-700">
        Search
      </button>
    </form>
  );
}