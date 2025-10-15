// // // // import { prisma } from "@/lib/prisma";

// // // // export default async function ProductPage({ params }: { params: { id: string }}) {
// // // //   const product = await prisma.product.findUnique({
// // // //     where: { id: params.id },
// // // //     include: { images: { select: { id: true }, take: 2 } }
// // // //   });
// // // //   if (!product) return <div>Not found</div>;

// // // //   return (
// // // //     <div className="grid md:grid-cols-2 gap-6">
// // // //       <div>
// // // //         <div className="grid grid-cols-2 gap-2">
// // // //           {product.images.map((img: { id: string }) => (
// // // //             <img key={img.id} src={`/api/images/${img.id}`} alt={product.name} className="rounded" />
// // // //           ))}
// // // //         </div>
// // // //       </div>
// // // //       <div className="space-y-3">
// // // //         <h1 className="text-2xl font-semibold">{product.name}</h1>
// // // //         <p className="text-sm text-gray-500">SKU: {product.sku}</p>
// // // //         <a href="/checkout" className="btn">Go to Checkout</a>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // import { prisma } from "@/lib/prisma";

// // // export const runtime = "nodejs"; // Prisma must run on Node, not Edge

// // // export default async function ProductPage({
// // //   params,
// // // }: { params: { id: string } }) {
// // //   // Build the query first so we can infer its return type
// // //   const q = prisma.product.findUnique({
// // //     where: { id: params.id },
// // //     include: { images: { select: { id: true }, take: 2 } },
// // //   });

// // //   type Product = NonNullable<Awaited<typeof q>>;

// // //   const product = await q;

// // //   if (!product) return <div>Not found</div>;

// // //   // From here, `product` is narrowed to `Product`, so `img` is inferred.
// // //   return (
// // //     <div className="grid md:grid-cols-2 gap-6">
// // //       <div>
// // //         <div className="grid grid-cols-2 gap-2">
// // //           {product.images.map((img: { id: string }) => (
// // //             <img
// // //               key={img.id}
// // //               src={`/api/images/${img.id}`}
// // //               alt={product.name}
// // //               className="rounded"
// // //               loading="lazy"
// // //             />
// // //           ))}
// // //         </div>
// // //       </div>
// // //       <div className="space-y-3">
// // //         <h1 className="text-2xl font-semibold">{product.name}</h1>
// // //         <p className="text-sm text-gray-500">SKU: {product.sku}</p>
// // //         <a href="/checkout" className="btn">Go to Checkout</a>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { prisma } from "@/lib/prisma";
// // import { inStockPieces } from "@/lib/stock";
// // import { getMarketplacePrice } from "@/lib/pricing";
// // import { Badge } from "@/components/ui/Badge";
// // import { Button } from "@/components/ui/Button";

// // export const runtime = "nodejs";

// // export default async function ProductPage({
// //   params,
// // }: { params: { id: string } }) {
// //   // Build query first to infer types
// //   const q = prisma.product.findUnique({
// //     where: { id: params.id },
// //     include: { images: { select: { id: true }, take: 2 } },
// //   });
// //   type Product = NonNullable<Awaited<typeof q>>;

// //   const product: Product | null = await q;
// //   if (!product) return <div>Not found</div>;

// //   // Type helper returns from their function signatures
// //   const pieces: Awaited<ReturnType<typeof inStockPieces>> = await inStockPieces(product.id);
// //   const prices: Awaited<ReturnType<typeof getMarketplacePrice>> = await getMarketplacePrice(product.id);

// //   const out = pieces <= 0;

// //   return (
// //     <div className="grid md:grid-cols-2 gap-6">
// //       <div>
// //         <div className="grid grid-cols-2 gap-2">
// //           {product.images.map((img: { id: string }) => (
// //             <img
// //               key={img.id}
// //               src={`/api/images/${img.id}`}
// //               alt={product.name}
// //               className={`rounded ${out ? "grayscale" : ""}`}
// //               loading="lazy"
// //             />
// //           ))}
// //           {product.images.length === 0 && (
// //             <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded col-span-2" />
// //           )}
// //         </div>
// //       </div>

// //       <div className="space-y-3">
// //         <div className="flex items-center gap-2">
// //           <h1 className="text-2xl font-semibold">{product.name}</h1>
// //           {!out ? (
// //             <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
// //               In stock
// //             </Badge>
// //           ) : (
// //             <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
// //               Out of stock
// //             </Badge>
// //           )}
// //         </div>
// //         <p className="text-sm text-gray-500">SKU: {product.sku}</p>

// //         <div className="space-y-1 text-sm">
// //           <div>
// //             Units: <b>{product.piecesPerPack}</b> pcs/pack · <b>{product.packsPerBox}</b> packs/box
// //           </div>
// //           <div className="opacity-80">
// //             Stock (pieces): <b>{pieces}</b>
// //           </div>
// //         </div>

// //         {/* Price display from marketplace channel */}
// //         <div className="card p-3 space-y-1 text-sm">
// //           <div className="font-medium">Marketplace prices</div>
// //           <div className="grid grid-cols-3 gap-2">
// //             <div>Box: {prices?.sellPerBox ? `₹${Number(prices.sellPerBox).toFixed(2)}` : "—"}</div>
// //             <div>Pack: {prices?.sellPerPack ? `₹${Number(prices.sellPerPack).toFixed(2)}` : "—"}</div>
// //             <div>Piece: {prices?.sellPerPiece ? `₹${Number(prices.sellPerPiece).toFixed(4)}` : "—"}</div>
// //           </div>
// //         </div>

// //         {/* For now, route guests to /checkout (Bundle-7 wires full cart flow) */}
// //         <div className="flex gap-2">
// //           <a href="/checkout" aria-disabled={out} className="btn">
// //             Proceed to Checkout
// //           </a>
// //           {!product.allowSellBox && <Badge>Box not sellable</Badge>}
// //           {!product.allowSellPack && <Badge>Pack not sellable</Badge>}
// //           {!product.allowSellPiece && <Badge>Piece not sellable</Badge>}
// //         </div>

// //         {out && (
// //           <p className="text-sm text-amber-600">
// //             This item is currently unavailable. Please check back later.
// //           </p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import { prisma } from "@/lib/prisma";
// import { inStockPieces } from "@/lib/stock";
// import { getMarketplacePrice } from "@/lib/pricing";
// import { Badge } from "@/components/ui/Badge";
// import AddToCart from "@/components/cart/AddToCart";
// // import { Button } from "@/components/ui/Button"; // <- not used

// export const runtime = "nodejs";

// const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

// export default async function ProductPage({ params }: { params: { id: string } }) {
//   // 1) Fetch product (we need id before other calls)
//   const q = prisma.product.findUnique({
//     where: { id: params.id },
//     include: { images: { select: { id: true }, take: 2 } },
//   });
//   type Product = NonNullable<Awaited<typeof q>>;

//   const product: Product | null = await q;
//   if (!product) return <div>Not found</div>;

//   // 2) Fetch dependent data in parallel
//   const [pieces, prices] = await Promise.all([
//     inStockPieces(product.id),
//     getMarketplacePrice(product.id),
//   ] as const);

//   const out = (pieces ?? 0) <= 0;

//   const boxPrice = prices?.sellPerBox;
//   const packPrice = prices?.sellPerPack;
//   const piecePrice = prices?.sellPerPiece;

//   const money = (v?: number | string | null, minFrac?: number) =>
//     v == null ? "—" : inr.format(Number(v)).replace("₹", "₹"); // keep symbol; adjust if you need spacing

//   return (
//     <div className="grid md:grid-cols-2 gap-6">
//       {/* Left: images */}
//       <div>
//         <div className="grid grid-cols-2 gap-2">
//           {product.images.length > 0 ? (
//             product.images.map((img: { id: string }) => (
//               <img
//                 key={img.id}
//                 src={`/api/images/${img.id}`}
//                 alt={product.name}
//                 className={`rounded ${out ? "grayscale" : ""}`}
//                 loading="lazy"
//               />
//             ))
//           ) : (
//             <div
//               className="h-40 bg-gray-100 dark:bg-gray-800 rounded col-span-2"
//               aria-label="No product images available"
//             />
//           )}
//         </div>
//       </div>

//       {/* Right: details */}
//       <div className="space-y-3">
//         <div className="flex items-center gap-2">
//           <h1 className="text-2xl font-semibold">{product.name}</h1>
//           {!out ? (
//             <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
//               In stock
//             </Badge>
//           ) : (
//             <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
//               Out of stock
//             </Badge>
//           )}
//         </div>

//         <p className="text-sm text-gray-500">SKU: {product.sku}</p>

//         <div className="space-y-1 text-sm">
//           <div>
//             Units: <b>{product.piecesPerPack}</b> pcs/pack ·{" "}
//             <b>{product.packsPerBox}</b> packs/box
//           </div>
//           <div className="opacity-80">
//             Stock (pieces): <b>{pieces}</b>
//           </div>
//         </div>

//         {/* Marketplace prices */}
//         <div className="card p-3 space-y-1 text-sm">
//           <div className="font-medium">Marketplace prices</div>
//           <div className="grid grid-cols-3 gap-2">
//             <div>Box: {money(boxPrice)}</div>
//             <div>Pack: {money(packPrice)}</div>
//             <div>
//               Piece:{" "}
//               {piecePrice == null
//                 ? "—"
//                 : // show more precision only for tiny piece prices if you want:
//                   Number(piecePrice) < 1
//                   ? `${inr.format(Number(piecePrice))} (${Number(piecePrice).toFixed(4)})`
//                   : inr.format(Number(piecePrice))}
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex flex-wrap items-center gap-2">
//           {!out ? (
//             <a href="/checkout" className="btn">
//               Proceed to Checkout
//             </a>
//           ) : (
//             <button className="btn opacity-60 pointer-events-none" disabled>
//               Proceed to Checkout
//             </button>
//           )}

//           {!product.allowSellBox && <Badge>Box not sellable</Badge>}
//           {!product.allowSellPack && <Badge>Pack not sellable</Badge>}
//           {!product.allowSellPiece && <Badge>Piece not sellable</Badge>}
//         </div>

//         {out && (
//           <p className="text-sm text-amber-600">
//             This item is currently unavailable. Please check back later.
//           </p>
//         )}

//         {/* Add to cart (client component) */}
//         <AddToCart
//           productId={product.id}
//           name={product.name}
//           allowBox={product.allowSellBox && !out}
//           allowPack={product.allowSellPack && !out}
//           allowPiece={product.allowSellPiece && !out}
//         />
//       </div>
//     </div>
//   );
// }


import { prisma } from "@/lib/prisma";
import { stockMap } from "@/lib/stock";
import AddToCart from "@/components/cart/AddToCart";
import { ImageGallery } from "@/components/product/ImageGallery";

export const runtime = "nodejs";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, active: true, visibleOnMarketplace: true },
    include: {
      images: { select: { id: true }, orderBy: { id: "asc" } },
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
  });

  if (!product) return <div>Not found</div>;

  const stock = await stockMap([product.id]);
  const inStockPieces = stock[product.id] ?? 0;
  const inStock = inStockPieces > 0;

  const price = product.prices[0] ?? null;

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Left: images */}
      <div>
        <ImageGallery
          images={product.images}
          productName={product.name}
          inStock={inStock}
        />
        {!inStock && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">
            Currently out of stock.
          </div>
        )}
      </div>

      {/* Right: details */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="text-sm text-gray-500">SKU: {product.sku}</div>

        <div className="space-y-1 text-sm">
          <div>
            Units: <b>{product.piecesPerPack}</b> pcs/pack ·{" "}
            <b>{product.packsPerBox}</b> packs/box
          </div>
          <div className="opacity-80">
            Stock (pieces): <b>{inStockPieces}</b>
          </div>
        </div>

        {/* Marketplace prices */}
        {price && (
          <div className="card p-3 space-y-1 text-sm">
            <div className="font-medium">Marketplace prices</div>
            <div className="grid grid-cols-3 gap-2">
              <div>Box: {price.sellPerBox ? inr.format(Number(price.sellPerBox)) : "—"}</div>
              <div>Pack: {price.sellPerPack ? inr.format(Number(price.sellPerPack)) : "—"}</div>
              <div>Piece: {price.sellPerPiece ? inr.format(Number(price.sellPerPiece)) : "—"}</div>
            </div>
          </div>
        )}

        {/* Add to cart */}
        <AddToCart
          productId={product.id}
          name={product.name}
          allowBox={product.allowSellBox && inStock && price?.sellPerBox != null}
          allowPack={product.allowSellPack && inStock && price?.sellPerPack != null}
          allowPiece={product.allowSellPiece && inStock && price?.sellPerPiece != null}
        />
      </div>
    </div>
  );
}

