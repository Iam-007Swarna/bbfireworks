import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InvoicesList() {
  const rows = await prisma.invoice.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      number: true,
      date: true,
      grand: true,
      order: {
        select: {
          customer: { select: { name: true, phone: true } },
        },
      },
    },
    take: 100,
  });

  type InvoiceRow = typeof rows[number];

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Invoices</h1>
      {rows.length === 0 ? (
        <p className="opacity-80">No invoices yet.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[700px] text-sm">
            <thead className="text-left">
              <tr>
                <th className="p-2">Number</th>
                <th className="p-2">Date</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Grand (₹)</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: InvoiceRow) => (
                <tr key={r.id}>
                  <td className="p-2">{r.number}</td>
                  <td className="p-2">{new Date(r.date).toLocaleString()}</td>
                  <td className="p-2">
                    {r.order?.customer?.name ?? "—"}
                    {r.order?.customer?.phone ? (
                      <span className="opacity-70"> ({r.order.customer.phone})</span>
                    ) : null}
                  </td>
                  <td className="p-2">{Number(r.grand).toFixed(2)}</td>
                  <td className="p-2">
                    <Link className="btn" href={`/admin/invoices/${r.id}`}>Open</Link>
                    <a className="btn ml-2" href={`/api/invoices/${r.id}/pdf`} target="_blank">
                      Download PDF
                    </a>
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
