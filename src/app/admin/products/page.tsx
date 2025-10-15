// import { prisma } from "@/lib/prisma";
// import Link from "next/link";

// export const runtime = "nodejs";

// export default async function Products() {
//   const q = prisma.product.findMany({ orderBy: { name: "asc" } });
//   type Items = Awaited<typeof q>;
//   type Item = Items[number];

//   const items = await q;

//   return (
//     <div className="space-y-3">
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold">Products</h1>
//         <Link href="/admin/products/new" className="btn">New</Link>
//       </div>
//       <div className="grid gap-2">
//         {items.map((p: Item) => (
//           <div key={p.id} className="card flex justify-between items-center">
//             <div>
//               <div className="font-medium">{p.name}</div>
//               <div className="text-xs text-gray-500">SKU: {p.sku}</div>
//             </div>
//             <a className="btn" href={`/admin/products/${p.id}`}>Edit</a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function Products() {
  const q = prisma.product.findMany({ orderBy: { name: "asc" } });
  type Items = Awaited<typeof q>;
  type Item = Items[number];

  const items = await q;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn">New</Link>
      </div>
      <div className="grid gap-2">
        {items.map((p: Item) => (
          <div key={p.id} className="card flex justify-between items-center">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">SKU: {p.sku}</div>
            </div>
            <a className="btn" href={`/admin/products/${p.id}`}>Edit</a>
          </div>
        ))}
      </div>
    </div>
  );
}
