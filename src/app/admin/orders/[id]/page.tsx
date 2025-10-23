import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toPieces, Unit } from "@/lib/units";
import { consumeFIFOOnce } from "@/lib/fifo";
import { nextInvoiceNumber } from "@/lib/invoice";
import { generateInvoicePdfBuffer } from "@/lib/pdf";
import { refreshInventoryCache } from "@/lib/inventoryCache";
import { FulfillOrderButton } from "@/components/FulfillOrderButton";

/* ---------- types ---------- */

type OutOfStockItem = {
  productName: string;
  sku: string;
  needed: number;
  available: number;
  unit: string;
};

type FulfillmentResult = {
  success: boolean;
  error?: string;
  outOfStockItems?: OutOfStockItem[];
  customerPhone?: string;
  customerName?: string;
};

/* ---------- server actions ---------- */

async function setStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/orders/${id}`);
}

async function fulfillOrder(formData: FormData): Promise<FulfillmentResult> {
  "use server";
  const id = String(formData.get("orderId") || "");
  if (!id) return { success: false, error: "Order ID is required" };

  try {
    // Load order with lines + product conversion info
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: { select: { id: true, name: true, sku: true, piecesPerPack: true, packsPerBox: true } }
          }
        },
        customer: true,
      }
    });
    if (!order) return { success: false, error: "Order not found" };
    if (order.status === "fulfilled") {
      // already invoiced?
      const inv = await prisma.invoice.findFirst({ where: { orderId: id }, select: { id: true } });
      if (inv) redirect(`/admin/invoices/${inv.id}`);
    }

    // Validate stock for all lines
    type FulfillOrderLine = typeof order.lines[number];
    const prodIds = order.lines.map((l: FulfillOrderLine) => l.productId);
    const grouped = await prisma.stockLedger.groupBy({
      by: ["productId"], _sum: { deltaPieces: true }, where: { productId: { in: prodIds } }
    });
    const stock: Record<string, number> = {};
    for (const g of grouped) stock[g.productId] = g._sum.deltaPieces ?? 0;

    // Check for out of stock items
    const outOfStockItems: OutOfStockItem[] = [];
    for (const l of order.lines as FulfillOrderLine[]) {
      const need = toPieces(l.qty, l.unit as Unit, l.product.piecesPerPack, l.product.packsPerBox);
      const available = stock[l.productId] ?? 0;
      if (available < need) {
        outOfStockItems.push({
          productName: l.product.name,
          sku: l.product.sku,
          needed: l.qty,
          available: Math.floor(available / (l.unit === "piece" ? 1 : l.unit === "pack" ? l.product.piecesPerPack : l.product.piecesPerPack * l.product.packsPerBox)),
          unit: l.unit,
        });
      } else {
        stock[l.productId] = available - need; // reserve
      }
    }

    // If any items are out of stock, return error with details
    if (outOfStockItems.length > 0) {
      return {
        success: false,
        error: "Insufficient stock for some items",
        outOfStockItems,
        customerPhone: order.customer?.phone,
        customerName: order.customer?.name,
      };
    }

    // All operations in a transaction to ensure atomicity
    let invoiceId = "";
    await prisma.$transaction(async (tx) => {
      // Consume FIFO for each line; compute subtotal
      let subtotal = 0;
      for (const l of order.lines as FulfillOrderLine[]) {
        subtotal += Number(l.pricePerUnit) * l.qty;
        await consumeFIFOOnce(
          l.productId,
          l.qty,
          l.unit as Unit,
          l.product.piecesPerPack,
          l.product.packsPerBox,
          order.id,
          tx // Pass transaction client
        );
      }

      // Create invoice
      const invoiceNo = await nextInvoiceNumber();
      const created = await tx.invoice.create({
        data: {
          orderId: order.id,
          number: invoiceNo,
          subtotal: String(subtotal),
          tax: "0",
          roundOff: "0",
          grand: String(subtotal),
          pdfBytes: Buffer.from(""), // filled after generation
        },
        select: { id: true }
      });
      invoiceId = created.id;

      // Mark order fulfilled
      await tx.order.update({ where: { id }, data: { status: "fulfilled" } });
    });

    // Generate & persist PDF (outside transaction for better performance)
    const pdf = await generateInvoicePdfBuffer(invoiceId);
    await prisma.invoice.update({ where: { id: invoiceId }, data: { pdfBytes: Uint8Array.from(pdf), pdfMime: "application/pdf" } });

    // Refresh inventory cache after stock consumption
    console.log("[Order Fulfillment] Refreshing inventory cache after order fulfillment...");
    await refreshInventoryCache();

    // Revalidate all pages that display stock information
    revalidatePath(`/admin/orders/${id}`, "page");
    revalidatePath("/admin/inventory", "layout");
    revalidatePath("/products", "layout"); // Revalidate all product pages
    revalidatePath("/(public)/products", "layout"); // Also revalidate the public route group
    revalidatePath("/", "layout"); // Revalidate home page

    console.log("[Order Fulfillment] Cache refreshed and paths revalidated");

    redirect(`/admin/invoices/${invoiceId}`);
  } catch (error) {
    console.error("[Order Fulfillment Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

async function cancelOrder(formData: FormData) {
  "use server";
  const id = String(formData.get("orderId") || "");
  if (!id) return;
  await prisma.order.update({ where: { id }, data: { status: "cancelled" } });
  revalidatePath(`/admin/orders/${id}`);
}

/* ---------- page ---------- */

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: { include: { product: { select: { name: true, sku: true, piecesPerPack: true, packsPerBox: true } } } },
      invoice: { select: { id: true, number: true } },
    },
  });
  if (!row) return <div>Not found</div>;

  type OrderLine = typeof row.lines[number];
  const subtotal = row.lines.reduce((a: number, l: OrderLine) => a + Number(l.pricePerUnit) * l.qty, 0);
  const canConfirm = row.status === "pending_whatsapp";
  const canFulfill = row.status === "confirmed" || row.status === "pending_whatsapp"; // allow direct fulfill if you want

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Order {row.id.slice(0,8)}…</h1>

      <div className="card p-3 grid sm:grid-cols-2 gap-2">
        <div>Status: <span className="badge">{row.status}</span></div>
        <div>Channel: <b>{row.channel}</b></div>
        <div>Created: {new Date(row.createdAt).toLocaleString()}</div>
        <div>Subtotal (lines): <b>₹{subtotal.toFixed(2)}</b></div>
        {row.invoice && (
          <div className="sm:col-span-2">
            Invoice: <a className="btn" href={`/admin/invoices/${row.invoice.id}`}>{row.invoice.number}</a>
          </div>
        )}
      </div>

      <div className="card p-3 space-y-1">
        <div className="font-medium">Customer</div>
        <div>Name: {row.customer?.name ?? "—"}</div>
        <div>Phone: {row.customer?.phone ?? "—"}</div>
        <div>Address: {row.customer?.address ?? "—"}</div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-[800px] text-sm">
          <thead className="text-left">
            <tr>
              <th className="p-2">Firecracker</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Price/Unit (₹)</th>
              <th className="p-2">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {row.lines.map((l: OrderLine) => {
              const total = Number(l.pricePerUnit) * l.qty;
              return (
                <tr key={l.id}>
                  <td className="p-2">{l.product.name}</td>
                  <td className="p-2">{l.product.sku}</td>
                  <td className="p-2">{l.unit}</td>
                  <td className="p-2">{l.qty}</td>
                  <td className="p-2">{Number(l.pricePerUnit).toFixed(l.unit === "piece" ? 4 : 2)}</td>
                  <td className="p-2">{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {canConfirm && (
          <form action={setStatus}>
            <input type="hidden" name="orderId" value={row.id} />
            <input type="hidden" name="status" value="confirmed" />
            <button className="btn" type="submit">Confirm</button>
          </form>
        )}
        {canFulfill && (
          <FulfillOrderButton orderId={row.id} fulfillOrder={fulfillOrder} />
        )}
        {row.status !== "cancelled" && !row.invoice && (
          <form action={cancelOrder}>
            <input type="hidden" name="orderId" value={row.id} />
            <button className="btn" type="submit">Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}
