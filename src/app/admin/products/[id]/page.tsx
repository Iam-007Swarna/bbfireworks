import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ImageUploader } from "@/components/admin/ImageUploader";

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

async function deleteImage(formData: FormData) {
  "use server";
  const imageId = String(formData.get("imageId") || "");
  const productId = String(formData.get("productId") || "");

  if (!imageId) return;

  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${productId}`);
}

export const runtime = "nodejs";

export default async function EditProduct({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // infer type from the actual query
  const q = prisma.product.findUnique({
    where: { id },
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
        <ImageUploader productId={p.id} />
        <div className="flex gap-3 flex-wrap">
          {p.images.map((img: { id: string }) => (
            <div key={img.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/images/${img.id}`} className="h-24 rounded border border-gray-200 dark:border-gray-700" alt="" />
              <form action={deleteImage} className="absolute top-1 right-1">
                <input type="hidden" name="imageId" value={img.id} />
                <input type="hidden" name="productId" value={p.id} />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete image"
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
