import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/date";

export default async function OrdersList() {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      channel: true,
      status: true,
      createdAt: true,
      customer: { select: { name: true, phone: true } },
      lines: { select: { qty: true } },
    },
  });

  type OrderRow = typeof rows[number];
  type OrderLine = OrderRow["lines"][number];

  const count = (s: string) => rows.filter((r: OrderRow) => r.status === s).length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>

      <div className="card p-3 flex gap-4 text-sm">
        <div>Pending WhatsApp: <b>{count("pending_whatsapp")}</b></div>
        <div>Confirmed: <b>{count("confirmed")}</b></div>
        <div>Fulfilled: <b>{count("fulfilled")}</b></div>
        <div>Cancelled: <b>{count("cancelled")}</b></div>
      </div>

      {rows.length === 0 ? (
        <p className="opacity-80">No orders yet.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[800px] text-sm">
            <thead className="text-left">
              <tr>
                <th className="p-2">Created</th>
                <th className="p-2">Channel</th>
                <th className="p-2">Status</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Lines</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: OrderRow) => (
                <tr key={r.id}>
                  <td className="p-2">{formatDateTime(r.createdAt)}</td>
                  <td className="p-2">{r.channel}</td>
                  <td className="p-2">
                    <span className="badge">{r.status}</span>
                  </td>
                  <td className="p-2">
                    {r.customer?.name ?? "—"}
                    {r.customer?.phone ? <span className="opacity-70"> ({r.customer.phone})</span> : null}
                  </td>
                  <td className="p-2">{r.lines.reduce((a: number, l: OrderLine) => a + l.qty, 0)}</td>
                  <td className="p-2">
                    <Link href={`/admin/orders/${r.id}`} className="btn">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
