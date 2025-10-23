import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toPieces } from "@/lib/units";
import { Decimal } from "@prisma/client/runtime/library";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CartSummary } from "@/components/checkout/CartSummary";
import { CheckoutGuard } from "@/components/checkout/CheckoutGuard";
import Link from "next/link";

type CartItem = {
  productId: string;
  name: string;
  unit: "box" | "pack" | "piece";
  qty: number;
};

type ProductWithPrice = {
  id: string;
  name: string;
  piecesPerPack: number;
  packsPerBox: number;
  prices: Array<{
    sellPerBox: Decimal | null;
    sellPerPack: Decimal | null;
    sellPerPiece: Decimal | null;
  }>;
};

async function createOrder(formData: FormData): Promise<void> {
  "use server";

  try {
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const note = String(formData.get("note") || "").trim();

    console.log("[createOrder] Starting order creation for:", { name, phone });

    // Validation
    if (!name || name.length < 2) {
      throw new Error("Please provide a valid name");
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      throw new Error("Please provide a valid 10-digit phone number");
    }

    // Changed: Use "items" to match the existing cart localStorage key
    const raw = String(formData.get("items") || "[]");
    console.log("[createOrder] Raw cart data from form:", raw);

    let items: CartItem[] = [];
    try {
      items = JSON.parse(raw) as CartItem[];
      console.log("[createOrder] Parsed cart items:", items.length, "items");
    } catch (err) {
      console.error("[createOrder] Failed to parse cart data:", err);
      throw new Error("Invalid cart data");
    }

    if (!items.length) {
      console.log("[createOrder] No items in cart, redirecting to /cart");
      redirect("/cart");
    }

  // Load products & current marketplace prices
  const ids = [...new Set(items.map((r) => r.productId))];
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      piecesPerPack: true,
      packsPerBox: true,
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
  const pmap = new Map<string, ProductWithPrice>(products.map((p) => [p.id, p]));

  // Stock validation
  const grouped = await prisma.stockLedger.groupBy({
    by: ["productId"],
    _sum: { deltaPieces: true },
    where: { productId: { in: ids } },
  });
  const stock: Record<string, number> = {};
  for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

  for (const item of items) {
    const p = pmap.get(item.productId);
    if (!p) throw new Error(`Product ${item.name} not found`);
    const need = toPieces(item.qty, item.unit, p.piecesPerPack, p.packsPerBox);
    if ((stock[item.productId] ?? 0) < need) {
      throw new Error(`${item.name} is out of stock`);
    }
    stock[item.productId] = (stock[item.productId] ?? 0) - need;
  }

  // Create or upsert customer
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { name, address },
    create: { name, phone, address },
    select: { id: true },
  });

  // Create Order with marketplace channel + pending_whatsapp
  const order = await prisma.order.create({
    data: {
      channel: "marketplace",
      status: "pending_whatsapp",
      customerId: customer.id,
      notes: note || `Guest checkout: ${name} / ${phone}`,
      lines: {
        create: items.map((item) => {
          const p = pmap.get(item.productId)!;
          const pr = p.prices[0];
          const pricePerUnit =
            item.unit === "box"
              ? pr?.sellPerBox ?? 0
              : item.unit === "pack"
              ? pr?.sellPerPack ?? 0
              : pr?.sellPerPiece ?? 0;
          return {
            productId: item.productId,
            unit: item.unit,
            qty: item.qty,
            pricePerUnit: Number(pricePerUnit), // Fixed: Convert to number, not string
          };
        }),
      },
    },
    select: { id: true },
  });

    // NOTE: Stock is NOT deducted here - it will be deducted when order is confirmed
    // This prevents stock loss if user doesn't send the WhatsApp message

    // Redirect to confirmation page instead of directly to WhatsApp
    console.log("[createOrder] Order created successfully:", order.id, "- Redirecting to confirm page");
    redirect(`/checkout/confirm?orderId=${order.id}`);
  } catch (error) {
    // Next.js redirect() throws NEXT_REDIRECT which we should re-throw
    // Check by digest property which is how Next.js 15+ identifies redirects
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // This is an actual error, log it
    console.error("Order creation error:", error);

    // Redirect back to checkout with error message
    const errorMessage = error instanceof Error ? error.message : "An error occurred during checkout";
    redirect(`/checkout?error=${encodeURIComponent(errorMessage)}`);
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Fetch products for cart summary pricing
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { active: true, visibleOnMarketplace: true },
    select: {
      id: true,
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
    <CheckoutGuard>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main checkout form */}
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    {error.includes("out of stock") && (
                      <div className="mt-3">
                        <Link
                          href="/cart"
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700 border-red-600 inline-flex items-center gap-1"
                        >
                          Go to Cart
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Complete your order details below. You&apos;ll review everything before sending to WhatsApp.
              </p>
            </div>

            <CheckoutForm action={createOrder} />
          </div>

          {/* Sidebar - Cart Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <CartSummary priceMap={priceMap} />
            </div>
          </div>
        </div>
      </div>
    </CheckoutGuard>
  );
}
