import { prisma } from "@/lib/prisma";
import CartClient from "@/app/(public)/cart/CartClient";
import { Modal } from "@/components/Modal";

export default async function CartModal() {
  // We do server-side price lookup for safety (unit prices may change)
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { active: true, visibleOnMarketplace: true },
    select: {
      id: true,
      name: true,
      sku: true,
      piecesPerPack: true,
      packsPerBox: true,
      allowSellBox: true,
      allowSellPack: true,
      allowSellPiece: true,
      prices: {
        where: {
          channel: "marketplace",
          activeFrom: { lte: now },
          OR: [{ activeTo: null }, { activeTo: { gte: now } }],
        },
        orderBy: { activeFrom: "desc" },
        take: 1,
        select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
      },
    },
  });

  const priceMap: Record<
    string,
    { box: number | null; pack: number | null; piece: number | null }
  > = {};
  for (const p of products) {
    const pr = p.prices[0];
    priceMap[p.id] = {
      box: pr?.sellPerBox ? Number(pr.sellPerBox) : null,
      pack: pr?.sellPerPack ? Number(pr.sellPerPack) : null,
      piece: pr?.sellPerPiece ? Number(pr.sellPerPiece) : null,
    };
  }

  return (
    <Modal title="Cart">
      <CartClient priceMap={priceMap} />
    </Modal>
  );
}
