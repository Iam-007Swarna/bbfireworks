// import { prisma } from "@/lib/prisma";
// import { redirect } from "next/navigation";

// async function createProduct(formData: FormData){
//   "use server";
//   const data = {
//     name: String(formData.get("name")||""),
//     sku: String(formData.get("sku")||""),
//     piecesPerPack: Number(formData.get("piecesPerPack")||"0"),
//     packsPerBox: Number(formData.get("packsPerBox")||"0"),
//     allowSellBox: !!formData.get("allowSellBox"),
//     allowSellPack: !!formData.get("allowSellPack"),
//     allowSellPiece: !!formData.get("allowSellPiece"),
//     visibleOnMarketplace: !!formData.get("visibleOnMarketplace"),
//     active: !!formData.get("active"),
//   };
//   await prisma.product.create({ data });
//   redirect("/admin/products");
// }

// export default function NewProduct() {
//   return (
//     <form action={createProduct} className="space-y-3">
//       <h1 className="text-xl font-semibold">New Product</h1>
//       <div className="grid sm:grid-cols-2 gap-3">
//         <label className="space-y-1">
//           <span>Name</span>
//           <input className="input" name="name" required />
//         </label>
//         <label className="space-y-1">
//           <span>SKU</span>
//           <input className="input" name="sku" required />
//         </label>
//         <label className="space-y-1">
//           <span>Pieces / Pack</span>
//           <input className="input" type="number" name="piecesPerPack" required />
//         </label>
//         <label className="space-y-1">
//           <span>Packs / Box</span>
//           <input className="input" type="number" name="packsPerBox" required />
//         </label>
//       </div>
//       <div className="flex gap-4 items-center flex-wrap">
//         <label><input type="checkbox" name="allowSellBox"/> Box</label>
//         <label><input type="checkbox" name="allowSellPack" defaultChecked/> Pack</label>
//         <label><input type="checkbox" name="allowSellPiece" defaultChecked/> Piece</label>
//         <label><input type="checkbox" name="visibleOnMarketplace" defaultChecked/> Show on marketplace</label>
//         <label><input type="checkbox" name="active" defaultChecked/> Active</label>
//       </div>
//       <button className="btn">Create</button>
//     </form>
//   );
// }

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function createProduct(formData: FormData){
  "use server";
  const name = String(formData.get("name")||"");

  // Auto-generate SKU from product name and timestamp
  const timestamp = Date.now().toString().slice(-6);
  const namePrefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const autoSku = `${namePrefix}-${timestamp}`;

  const data = {
    name,
    sku: autoSku,
    piecesPerPack: Number(formData.get("piecesPerPack")||"0"),
    packsPerBox: Number(formData.get("packsPerBox")||"0"),
    allowSellBox: !!formData.get("allowSellBox"),
    allowSellPack: !!formData.get("allowSellPack"),
    allowSellPiece: !!formData.get("allowSellPiece"),
    visibleOnMarketplace: !!formData.get("visibleOnMarketplace"),
    active: !!formData.get("active"),
  };
  await prisma.product.create({ data });
  redirect("/admin/products");
}

export default function NewProduct() {
  return (
    <form action={createProduct} className="space-y-3">
      <h1 className="text-xl font-semibold">New Product</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span>Name</span>
          <input className="input" name="name" required />
        </label>
        <label className="space-y-1">
          <span>Pieces / Pack</span>
          <input className="input" type="number" name="piecesPerPack" min={1} required />
        </label>
        <label className="space-y-1">
          <span>Packs / Box</span>
          <input className="input" type="number" name="packsPerBox" min={1} required />
        </label>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        SKU will be auto-generated based on product name
      </p>
      <div className="flex gap-4 items-center flex-wrap">
        <label><input type="checkbox" name="allowSellBox"/> Box</label>
        <label><input type="checkbox" name="allowSellPack" defaultChecked/> Pack</label>
        <label><input type="checkbox" name="allowSellPiece" defaultChecked/> Piece</label>
        <label><input type="checkbox" name="visibleOnMarketplace" defaultChecked/> Show on marketplace</label>
        <label><input type="checkbox" name="active" defaultChecked/> Active</label>
      </div>
      <button className="btn">Create</button>
    </form>
  );
}
