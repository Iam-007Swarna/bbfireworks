import { prisma } from "@/lib/prisma";

/** Get active marketplace prices for a product (box/pack/piece may be null) */
export async function getMarketplacePrice(productId: string) {
  const now = new Date();
  return prisma.priceList.findFirst({
    where: {
      productId,
      channel: "marketplace",
      activeFrom: { lte: now },
      OR: [{ activeTo: null }, { activeTo: { gte: now } }],
    },
    orderBy: { activeFrom: "desc" },
    select: { sellPerBox: true, sellPerPack: true, sellPerPiece: true },
  });
}
