import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer } from "@/lib/pdf";
import { revalidatePath } from "next/cache";

async function regen(formData: FormData) {
  "use server";
  const id = String(formData.get("invoiceId") || "");
  if (!id) return;
  const buf = await generateInvoicePdfBuffer(id);
  await prisma.invoice.update({
    where: { id },
    data: { pdfBytes: Uint8Array.from(buf), pdfMime: "application/pdf" },
  });
  revalidatePath(`/admin/invoices/${id}`);
}

export default async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          customer: true,
          lines: { include: { product: { select: { name: true, sku: true } } } },
        },
      },
    },
  });

  if (!inv) return <div>Not found</div>;

  type OrderLine = NonNullable<typeof inv.order>["lines"][number];

  const subtotal = Number(inv.subtotal);
  const tax = Number(inv.tax);
  const roundOff = Number(inv.roundOff);
  const grand = Number(inv.grand);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Invoice {inv.number}</h1>

      <div className="card p-3 space-y-1">
        <div>Date: <b>{new Date(inv.date).toLocaleString()}</b></div>
        <div>Customer: <b>{inv.order?.customer?.name ?? "—"}</b></div>
        {inv.order?.customer?.phone && <div>Phone: {inv.order.customer.phone}</div>}
        {inv.order?.customer?.address && <div>Address: {inv.order.customer.address}</div>}
      </div>

      <div className="overflow-auto">
        <table className="min-w-[700px] text-sm">
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
            {inv.order?.lines.map((l: OrderLine) => {
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

      <div className="card p-3 flex flex-wrap gap-6">
        <div>Subtotal: <b>₹{subtotal.toFixed(2)}</b></div>
        <div>Tax: <b>₹{tax.toFixed(2)}</b></div>
        <div>Round off: <b>₹{roundOff.toFixed(2)}</b></div>
        <div>Grand: <b>₹{grand.toFixed(2)}</b></div>
      </div>

      <div className="flex gap-2">
        <a className="btn" href={`/api/invoices/${inv.id}/pdf`} target="_blank">Download PDF</a>
        <form action={regen}>
          <input type="hidden" name="invoiceId" value={inv.id} />
          <button className="btn" type="submit">Regenerate PDF</button>
        </form>
      </div>
    </div>
  );
}
