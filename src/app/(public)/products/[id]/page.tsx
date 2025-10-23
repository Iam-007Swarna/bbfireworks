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


import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInventoryMap } from "@/lib/inventoryCache";
import AddToCart from "@/components/cart/AddToCart";
import { ImageGallery } from "@/components/product/ImageGallery";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { StockDisplay } from "@/components/product/StockDisplay";

export const runtime = "nodejs";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

// Generate static params for top products (ISR for others)
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      visibleOnMarketplace: true,
    },
    select: { id: true },
    take: 20, // Pre-generate top 20 products at build time
  });

  return products.map((product) => ({
    id: product.id,
  }));
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id, active: true, visibleOnMarketplace: true },
    select: {
      name: true,
      sku: true,
      description: true,
      images: { select: { id: true }, take: 1 },
      prices: {
        where: {
          channel: "marketplace",
          activeFrom: { lte: new Date() },
          OR: [{ activeTo: null }, { activeTo: { gte: new Date() } }],
        },
        orderBy: { activeFrom: "desc" },
        take: 1,
        select: { sellPerPack: true, sellPerPiece: true, sellPerBox: true },
      },
    },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const price = product.prices[0];
  const productPrice = price?.sellPerPack || price?.sellPerPiece || price?.sellPerBox;
  const imageId = product.images[0]?.id;
  const imageUrl = imageId ? `/api/images/${imageId}` : '/og-image.jpg';

  return {
    title: product.name,
    description: product.description || `${product.name} - SKU: ${product.sku}. Premium quality fireworks available at BB Fireworks, Nilganj.`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - SKU: ${product.sku}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `${product.name} - SKU: ${product.sku}`,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/products/${id}`,
    },
    other: {
      // Structured Data - Product Schema
      'application-ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        description: product.description || `${product.name} - Premium fireworks`,
        image: imageUrl,
        offers: productPrice ? {
          '@type': 'Offer',
          price: Number(productPrice),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'BB Fireworks, Nilganj',
          },
        } : undefined,
        brand: {
          '@type': 'Brand',
          name: 'BB Fireworks',
        },
      }),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id, active: true, visibleOnMarketplace: true },
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

  // Fetch recommendations (other products)
  const recommendations = await prisma.product.findMany({
    where: {
      active: true,
      visibleOnMarketplace: true,
      id: { not: id },
    },
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
    take: 4,
    orderBy: { name: "asc" },
  });

  const finalRecommendations = recommendations;

  // Get detailed inventory from cache (with box/pack/piece breakdown)
  const allProductIds = [product.id, ...finalRecommendations.map(p => p.id)];
  const inventoryData = await getInventoryMap(allProductIds);

  const inventory = inventoryData.get(product.id);
  const inStockPieces = inventory?.totalPieces ?? 0;
  const inStock = inStockPieces > 0;

  const price = product.prices[0] ?? null;

  // Get the best starting price for display
  let startingPrice = null;
  let startingPriceUnit = "";
  if (price?.sellPerPack) {
    startingPrice = Number(price.sellPerPack);
    startingPriceUnit = "pack";
  } else if (price?.sellPerPiece) {
    startingPrice = Number(price.sellPerPiece);
    startingPriceUnit = "piece";
  } else if (price?.sellPerBox) {
    startingPrice = Number(price.sellPerBox);
    startingPriceUnit = "box";
  }

  return (
    <>
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Left: images */}
      <div>
        <ImageGallery
          images={product.images}
          productName={product.name}
          inStock={inStock}
        />
        {!inStock && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">
            Currently out of stock.
          </div>
        )}
      </div>

      {/* Right: details */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-1 text-sm text-gray-500">SKU: {product.sku}</div>
        </div>

        {/* Price Display - Prominent */}
        {startingPrice && (
          <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">Starting from</div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {inr.format(startingPrice)}
              <span className="text-base font-normal text-gray-600 dark:text-gray-400 ml-2">
                per {startingPriceUnit}
              </span>
            </div>
          </div>
        )}

        {/* Low Stock Alert - Show if any unit has less than 10 available */}
        {inventory && inStock && (
          <LowStockAlert
            availableBoxes={inventory.availableBoxes}
            availablePacks={inventory.availablePacks}
            availablePieces={inventory.availablePieces}
            piecesPerPack={inventory.piecesPerPack}
            packsPerBox={inventory.packsPerBox}
            threshold={10}
            showDetails={true}
          />
        )}

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {inStock ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                In Stock
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-red-700 dark:text-red-400">Out of Stock</span>
            </>
          )}
        </div>

        {/* Detailed Stock Display */}
        {inventory && inStock && (
          <StockDisplay
            availableBoxes={inventory.availableBoxes}
            availablePacks={inventory.availablePacks}
            availablePieces={inventory.availablePieces}
            piecesPerPack={inventory.piecesPerPack}
            packsPerBox={inventory.packsPerBox}
            compact={false}
            lastUpdated={inventory.lastUpdated}
          />
        )}

        {/* Product Details */}
        <div className="card p-4 space-y-2">
          <h3 className="font-semibold text-sm">Product Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">Pieces per Pack:</div>
            <div className="font-medium">{product.piecesPerPack}</div>
            <div className="text-gray-600 dark:text-gray-400">Packs per Box:</div>
            <div className="font-medium">{product.packsPerBox}</div>
            <div className="text-gray-600 dark:text-gray-400">Total per Box:</div>
            <div className="font-medium">{product.piecesPerPack * product.packsPerBox} pieces</div>
          </div>
        </div>

        {/* All Pricing Options */}
        {price && (
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-sm">All Pricing Options</h3>
            <div className="space-y-2">
              {price.sellPerBox && (
                <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm">Per Box</span>
                  <span className="font-semibold">{inr.format(Number(price.sellPerBox))}</span>
                </div>
              )}
              {price.sellPerPack && (
                <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm">Per Pack</span>
                  <span className="font-semibold">{inr.format(Number(price.sellPerPack))}</span>
                </div>
              )}
              {price.sellPerPiece && (
                <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm">Per Piece</span>
                  <span className="font-semibold">{inr.format(Number(price.sellPerPiece))}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <AddToCart
          productId={product.id}
          name={product.name}
          allowBox={product.allowSellBox && inStock && price?.sellPerBox != null && (inventory?.availableBoxes ?? 0) > 0}
          allowPack={product.allowSellPack && inStock && price?.sellPerPack != null && (inventory?.availablePacks ?? 0) > 0}
          allowPiece={product.allowSellPiece && inStock && price?.sellPerPiece != null && (inventory?.availablePieces ?? 0) > 0}
          availableBoxes={inventory?.availableBoxes ?? 0}
          availablePacks={inventory?.availablePacks ?? 0}
          availablePieces={inventory?.availablePieces ?? 0}
        />
      </div>
    </div>

    {/* Recommendations section */}
    {finalRecommendations.length > 0 && (
      <div className="mt-12 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          You may also like
        </h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {finalRecommendations.map((p) => {
            const recInventory = inventoryData.get(p.id);
            const recInStock = (recInventory?.totalPieces ?? 0) > 0;
            const imgId = p.images[0]?.id;
            const recPrice = p.prices[0];

            // Determine which price to show (prefer pack, then piece, then box)
            let displayPrice = null;
            if (recPrice?.sellPerPack) displayPrice = inr.format(Number(recPrice.sellPerPack));
            else if (recPrice?.sellPerPiece) displayPrice = inr.format(Number(recPrice.sellPerPiece));
            else if (recPrice?.sellPerBox) displayPrice = inr.format(Number(recPrice.sellPerBox));

            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className={`card group relative ${recInStock ? "" : "opacity-70"}`}
              >
                {!recInStock && (
                  <span className="absolute top-2 left-2 z-10 badge bg-red-100 text-red-700 dark:bg-red-600 dark:text-white">
                    Out of stock
                  </span>
                )}
                {imgId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/images/${imgId}`}
                    alt={p.name}
                    className={`w-full h-40 object-cover rounded ${recInStock ? "" : "grayscale"}`}
                  />
                ) : (
                  <div
                    className={`h-40 rounded ${recInStock ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-700"}`}
                  />
                )}
                <div className="mt-2">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                  {displayPrice && (
                    <div className="text-sm font-semibold mt-1 text-green-700 dark:text-green-400">
                      {displayPrice}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    )}
  </>
  );
}

