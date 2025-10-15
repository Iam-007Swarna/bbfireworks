import { prisma } from "@/lib/prisma";

export default async function InventoryPage() {
  // Get all active products
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, sku: true, piecesPerPack: true, packsPerBox: true, allowSellBox: true, allowSellPack: true, allowSellPiece: true },
    orderBy: { name: "asc" },
  });

  if (!products.length) {
    return <p className="opacity-80">No products yet. Create some in Admin → Products.</p>;
  }

  // Aggregate current stock in pieces per product
  const grouped = await prisma.stockLedger.groupBy({
    by: ["productId"],
    _sum: { deltaPieces: true },
    where: { productId: { in: products.map((p: { id: string }) => p.id) } },
  });

  const stock: Record<string, number> = {};
  for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Inventory</h1>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="p-2">Firecracker</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Stock (pieces)</th>
              <th className="p-2">Approx. packs</th>
              <th className="p-2">Approx. boxes</th>
              <th className="p-2">Sell units</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: { id: string, name: string, sku: string, piecesPerPack: number, packsPerBox: number, allowSellBox: boolean, allowSellPack: boolean, allowSellPiece: boolean }) => {
              const pieces = stock[p.id] ?? 0;
              const packs = Math.floor(pieces / p.piecesPerPack);
              const boxes = Math.floor(packs / p.packsPerBox);
              const low = pieces <= 0;

              return (
                <tr key={p.id} className={low ? "opacity-60" : ""}>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">
                    {pieces}
                    {low && (
                      <span className="ml-2 text-red-600 text-xs">Out of stock</span>
                    )}
                  </td>
                  <td className="p-2">{packs}</td>
                  <td className="p-2">{boxes}</td>
                  <td className="p-2 text-xs">
                    {p.allowSellBox ? "Box " : ""}
                    {p.allowSellPack ? "Pack " : ""}
                    {p.allowSellPiece ? "Piece" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <a href="/admin/purchases/new" className="btn">+ Receive stock (new purchase)</a>
      </div>
    </div>
  );
}
