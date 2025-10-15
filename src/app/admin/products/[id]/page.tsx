// // import { prisma } from "@/lib/prisma";
// // import { revalidatePath } from "next/cache";

// // async function saveProduct(_: any, formData: FormData) {
// //   "use server";
// //   const id = String(formData.get("id")||"");
// //   const data = {
// //     name: String(formData.get("name")||""),
// //     sku: String(formData.get("sku")||""),
// //     piecesPerPack: Number(formData.get("piecesPerPack")||"0"),
// //     packsPerBox: Number(formData.get("packsPerBox")||"0"),
// //     allowSellBox: !!formData.get("allowSellBox"),
// //     allowSellPack: !!formData.get("allowSellPack"),
// //     allowSellPiece: !!formData.get("allowSellPiece"),
// //     visibleOnMarketplace: !!formData.get("visibleOnMarketplace"),
// //     active: !!formData.get("active"),
// //   };
// //   await prisma.product.update({ where: { id }, data });
// //   revalidatePath("/admin/products");
// // }

// // export default async function EditProduct({ params }: { params: { id: string }}) {
// //   const p = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } });
// //   if (!p) return <div>Not found</div>;
// //   return (
// //     <div className="space-y-4">
// //       <form action={saveProduct} className="space-y-3">
// //         <input type="hidden" name="id" value={p.id}/>
// //         <div className="grid sm:grid-cols-2 gap-3">
// //           <label className="space-y-1">
// //             <span>Name</span>
// //             <input className="input" name="name" defaultValue={p.name}/>
// //           </label>
// //           <label className="space-y-1">
// //             <span>SKU</span>
// //             <input className="input" name="sku" defaultValue={p.sku}/>
// //           </label>
// //           <label className="space-y-1">
// //             <span>Pieces / Pack</span>
// //             <input className="input" name="piecesPerPack" type="number" defaultValue={p.piecesPerPack}/>
// //           </label>
// //           <label className="space-y-1">
// //             <span>Packs / Box</span>
// //             <input className="input" name="packsPerBox" type="number" defaultValue={p.packsPerBox}/>
// //           </label>
// //         </div>
// //         <div className="flex gap-4 items-center flex-wrap">
// //           <label><input type="checkbox" name="allowSellBox" defaultChecked={p.allowSellBox}/> Box</label>
// //           <label><input type="checkbox" name="allowSellPack" defaultChecked={p.allowSellPack}/> Pack</label>
// //           <label><input type="checkbox" name="allowSellPiece" defaultChecked={p.allowSellPiece}/> Piece</label>
// //           <label><input type="checkbox" name="visibleOnMarketplace" defaultChecked={p.visibleOnMarketplace}/> Show on marketplace</label>
// //           <label><input type="checkbox" name="active" defaultChecked={p.active}/> Active</label>
// //         </div>
// //         <button className="btn">Save</button>
// //       </form>

// //       <div className="space-y-2">
// //         <span className="font-medium">Images (1–2)</span>
// //         <form action="/api/upload/product-image" method="POST" encType="multipart/form-data" className="flex gap-2">
// //           <input type="hidden" name="productId" value={p.id}/>
// //           <input type="file" name="file" accept="image/*" className="input"/>
// //           <button className="btn">Upload</button>
// //         </form>
// //         <div className="flex gap-2">
// //           {p.images.map(img => <img key={img.id} src={`/api/images/${img.id}`} className="h-20 rounded" alt="" />)}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// async function saveProduct(formData: FormData) {
//   "use server";
//   const id = String(formData.get("id") || "");
//   const data = {
//     name: String(formData.get("name") || ""),
//     sku: String(formData.get("sku") || ""),
//     piecesPerPack: Number(formData.get("piecesPerPack") || "0"),
//     packsPerBox: Number(formData.get("packsPerBox") || "0"),
//     allowSellBox: !!formData.get("allowSellBox"),
//     allowSellPack: !!formData.get("allowSellPack"),
//     allowSellPiece: !!formData.get("allowSellPiece"),
//     visibleOnMarketplace: !!formData.get("visibleOnMarketplace"),
//     active: !!formData.get("active"),
//   };
//   await prisma.product.update({ where: { id }, data });
//   revalidatePath("/admin/products");
// }

// export const runtime = "nodejs";

// export default async function EditProduct({
//   params,
// }: { params: { id: string } }) {
//   // Build query first to infer types
//   const q = prisma.product.findUnique({
//     where: { id: params.id },
//     include: { images: true },
//   });
//   type Product = NonNullable<Awaited<typeof q>>;

//   const p = await q;
//   if (!p) return <div>Not found</div>;

//   return (
//     <div className="space-y-4">
//       <form action={saveProduct} className="space-y-3">
//         <input type="hidden" name="id" value={p.id} />
//         <div className="grid sm:grid-cols-2 gap-3">
//           <label className="space-y-1">
//             <span>Name</span>
//             <input className="input" name="name" defaultValue={p.name} />
//           </label>
//           <label className="space-y-1">
//             <span>SKU</span>
//             <input className="input" name="sku" defaultValue={p.sku} />
//           </label>
//           <label className="space-y-1">
//             <span>Pieces / Pack</span>
//             <input
//               className="input"
//               name="piecesPerPack"
//               type="number"
//               defaultValue={p.piecesPerPack}
//             />
//           </label>
//           <label className="space-y-1">
//             <span>Packs / Box</span>
//             <input
//               className="input"
//               name="packsPerBox"
//               type="number"
//               defaultValue={p.packsPerBox}
//             />
//           </label>
//         </div>
//         <div className="flex gap-4 items-center flex-wrap">
//           <label>
//             <input type="checkbox" name="allowSellBox" defaultChecked={p.allowSellBox} /> Box
//           </label>
//           <label>
//             <input type="checkbox" name="allowSellPack" defaultChecked={p.allowSellPack} /> Pack
//           </label>
//           <label>
//             <input type="checkbox" name="allowSellPiece" defaultChecked={p.allowSellPiece} /> Piece
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               name="visibleOnMarketplace"
//               defaultChecked={p.visibleOnMarketplace}
//             />{" "}
//             Show on marketplace
//           </label>
//           <label>
//             <input type="checkbox" name="active" defaultChecked={p.active} /> Active
//           </label>
//         </div>
//         <button className="btn">Save</button>
//       </form>

//       <div className="space-y-2">
//         <span className="font-medium">Images (1–2)</span>
//         <form
//           action="/api/upload/product-image"
//           method="POST"
//           encType="multipart/form-data"
//           className="flex gap-2"
//         >
//           <input type="hidden" name="productId" value={p.id} />
//           <input type="file" name="file" accept="image/*" className="input" />
//           <button className="btn">Upload</button>
//         </form>
//         <div className="flex gap-2">
//           {p.images.map((img: { id: string }) => (
//             <img key={img.id} src={`/api/images/${img.id}`} className="h-20 rounded" alt="" />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// form posts directly to this action, so it should take only FormData
async function saveProduct(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") || ""),
    sku: String(formData.get("sku") || ""),
    piecesPerPack: Number(formData.get("piecesPerPack") || "0"),
    packsPerBox: Number(formData.get("packsPerBox") || "0"),
    allowSellBox: !!formData.get("allowSellBox"),
    allowSellPack: !!formData.get("allowSellPack"),
    allowSellPiece: !!formData.get("allowSellPiece"),
    visibleOnMarketplace: !!formData.get("visibleOnMarketplace"),
    active: !!formData.get("active"),
  };
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
}

export const runtime = "nodejs";

export default async function EditProduct({
  params,
}: { params: { id: string } }) {
  // infer type from the actual query
  const q = prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  type Product = NonNullable<Awaited<typeof q>>;

  const p: Product | null = await q;
  if (!p) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <form action={saveProduct} className="space-y-3">
        <input type="hidden" name="id" value={p.id} />
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span>Name</span>
            <input className="input" name="name" defaultValue={p.name} />
          </label>
          <label className="space-y-1">
            <span>SKU</span>
            <input className="input" name="sku" defaultValue={p.sku} />
          </label>
          <label className="space-y-1">
            <span>Pieces / Pack</span>
            <input className="input" name="piecesPerPack" type="number" min={1} defaultValue={p.piecesPerPack} />
          </label>
          <label className="space-y-1">
            <span>Packs / Box</span>
            <input className="input" name="packsPerBox" type="number" min={1} defaultValue={p.packsPerBox} />
          </label>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <label><input type="checkbox" name="allowSellBox" defaultChecked={p.allowSellBox} /> Box</label>
          <label><input type="checkbox" name="allowSellPack" defaultChecked={p.allowSellPack} /> Pack</label>
          <label><input type="checkbox" name="allowSellPiece" defaultChecked={p.allowSellPiece} /> Piece</label>
          <label><input type="checkbox" name="visibleOnMarketplace" defaultChecked={p.visibleOnMarketplace} /> Show on marketplace</label>
          <label><input type="checkbox" name="active" defaultChecked={p.active} /> Active</label>
        </div>
        <button className="btn">Save</button>
      </form>

      <div className="space-y-2">
        <span className="font-medium">Images (1–2)</span>
        <form action="/api/upload/product-image" method="POST" encType="multipart/form-data" className="flex gap-2">
          <input type="hidden" name="productId" value={p.id} />
          <input type="file" name="file" accept="image/*" className="input" />
          <button className="btn">Upload</button>
        </form>
        <div className="flex gap-2">
          {p.images.map((img: { id: string }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={`/api/images/${img.id}`} className="h-20 rounded" alt="" />
          ))}
        </div>
      </div>
    </div>
  );
}
