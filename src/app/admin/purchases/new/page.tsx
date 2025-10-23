import { prisma } from "@/lib/prisma";
import { createPurchase } from "./actions";
import LinesBuilder from "./LinesBuilder";

export const runtime = "nodejs";

export default async function NewPurchase() {
  // Minimal product list for the line builder
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, sku: true, piecesPerPack: true, packsPerBox: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Purchase</h1>

      <form action={createPurchase} className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span>Supplier (create or reuse by name)</span>
            <input className="input" name="supplierName" required placeholder="e.g., Nilganj Wholesale" />
          </label>
          <label className="space-y-1">
            <span>Date</span>
            <input className="input" name="date" type="date" required />
          </label>
          <label className="space-y-1">
            <span>Bill No (optional)</span>
            <input className="input" name="billNo" placeholder="e.g., INV-123" />
          </label>
        </div>

        <div className="space-y-2">
          <span className="font-medium">Attachment (optional)</span>
          <input className="input" type="file" name="attachment" accept="image/*,application/pdf" />
        </div>

        <LinesBuilder products={products} />

        <button className="btn">Save Purchase</button>
      </form>
    </div>
  );
}
