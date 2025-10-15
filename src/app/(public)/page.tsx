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

export const runtime = "nodejs";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  
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
    include: { images: { select: { id: true }, take: 1 } },
    orderBy: { name: "asc" },
  });

  const stocks = await stockMap(products.map((p: { id: string }) => p.id));

  return (
    <div className="space-y-4">
      <SearchBar defaultValue={q} />
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {products.map((p: { id: string; name: string; sku: string; images: { id: string }[] }) => {
          const inStock = (stocks[p.id] ?? 0) > 0;
          const imgId = p.images[0]?.id;
          
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className={`card group relative ${inStock ? "" : "opacity-70"}`}
            >
              {!inStock && (
                <span className="absolute top-2 left-2 badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  Out of stock
                </span>
              )}
              {imgId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/images/${imgId}`}
                  alt={p.name}
                  className={`w-full h-40 object-cover rounded ${inStock ? "" : "grayscale"}`}
                />
              ) : (
                <div 
                  className={`h-40 rounded ${inStock ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-700"}`} 
                />
              )}
              <div className="mt-2">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-gray-500">SKU: {p.sku}</div>
              </div>
            </Link>
          );
        })}
        {products.length === 0 && (
          <div className="text-sm opacity-70">No products found.</div>
        )}
      </div>
    </div>
  );
}

function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form className="flex gap-2" action="/">
      <input
        name="q"
        className="input w-full sm:w-96"
        placeholder="Search by name or SKU"
        defaultValue={defaultValue}
      />
      <button className="btn">Search</button>
    </form>
  );
}