/* prisma/seed.ts */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Users ---
  const adminEmail = 'swarnavab98@gmail.com';
  const adminPassword = 'moc.liamg@89bavanraws'; // reverse of email
  const memberEmail = 'instel.llc@gmail.com';
  const memberPassword = 'moc.liamg@cll.letsni'; // reverse of email

  const [admin, member] = await Promise.all([
    prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: 'Swarnava B',
        role: 'admin',
        passwordHash: await bcrypt.hash(adminPassword, 10),
      },
    }),
    prisma.user.upsert({
      where: { email: memberEmail },
      update: {},
      create: {
        email: memberEmail,
        name: 'Instel LLC',
        role: 'member',
        passwordHash: await bcrypt.hash(memberPassword, 10),
      },
    }),
  ]);

  // --- Products ---
  const rocket = await prisma.product.upsert({
    where: { sku: 'CRK-001' },
    update: {},
    create: {
      sku: 'CRK-001',
      name: 'Sky Rocket Mega',
      piecesPerPack: 6,
      packsPerBox: 10,
      allowSellBox: true,
      allowSellPack: true,
      allowSellPiece: true,
      visibleOnMarketplace: true,
      active: true,
    },
  });

  const flower = await prisma.product.upsert({
    where: { sku: 'CRK-002' },
    update: {},
    create: {
      sku: 'CRK-002',
      name: 'Flower Pot Premium',
      piecesPerPack: 10,
      packsPerBox: 12,
      allowSellBox: true,
      allowSellPack: true,
      allowSellPiece: true,
      visibleOnMarketplace: true,
      active: true,
    },
  });

  // --- Initial stock via StockLedger (+ pieces, with unit cost per piece) ---
  // Sky Rocket: 2 boxes @ ₹20.00 per piece
  // Pieces per box = packsPerBox * piecesPerPack = 10 * 6 = 60 → 2 boxes = 120 pieces
  await prisma.stockLedger.create({
    data: {
      productId: rocket.id,
      deltaPieces: 120,
      unitCostPiece: '20.00', // Decimal as string for precision
      sourceType: 'purchase',
      sourceId: 'seed-purchase-rocket',
    },
  });

  // Flower Pot: 3 boxes @ ₹5.50 per piece
  // Pieces per box = 12 * 10 = 120 → 3 boxes = 360 pieces
  await prisma.stockLedger.create({
    data: {
      productId: flower.id,
      deltaPieces: 360,
      unitCostPiece: '5.50',
      sourceType: 'purchase',
      sourceId: 'seed-purchase-flower',
    },
  });

  // --- Price lists (marketplace + retail) ---
  // Rocket
  await prisma.priceList.create({
    data: {
      productId: rocket.id,
      channel: 'marketplace',
      sellPerBox: '1800.00',      // example sell rates
      sellPerPack: '180.00',
      sellPerPiece: '30.0000',
      activeFrom: new Date(),
    },
  });
  await prisma.priceList.create({
    data: {
      productId: rocket.id,
      channel: 'retail',
      sellPerBox: '1750.00',
      sellPerPack: '175.00',
      sellPerPiece: '28.0000',
      activeFrom: new Date(),
    },
  });

  // Flower Pot
  await prisma.priceList.create({
    data: {
      productId: flower.id,
      channel: 'marketplace',
      sellPerBox: '1100.00',
      sellPerPack: '95.00',
      sellPerPiece: '12.0000',
      activeFrom: new Date(),
    },
  });
  await prisma.priceList.create({
    data: {
      productId: flower.id,
      channel: 'retail',
      sellPerBox: '1050.00',
      sellPerPack: '90.00',
      sellPerPiece: '11.0000',
      activeFrom: new Date(),
    },
  });

  // --- Optional: Supplier & RateCard for 2025-26 (demo) ---
  const supplier = await prisma.supplier.upsert({
    where: { name: 'Nilganj Wholesale' },
    update: {},
    create: { name: 'Nilganj Wholesale', phone: '9830463926' },
  });

  await prisma.rateCard.create({
    data: {
      productId: rocket.id,
      supplierId: supplier.id,
      year: 2025,
      buyPerBox: '1200.00',
      buyPerPack: '120.00',
      buyPerPiece: '20.0000',
      notes: 'Seed demo rate',
    },
  });

  console.log('Seeded: ', {
    admin: admin.email,
    member: member.email,
    products: [rocket.sku, flower.sku],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });