import { prisma } from "@/lib/prisma";

/** Generate a simple FY-based invoice number: BBF-YY-YY-#### */
export async function nextInvoiceNumber() {
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // Apr-Mar FY
  const yy1 = String(fyStartYear).slice(-2);
  const yy2 = String(fyStartYear + 1).slice(-2);
  const prefix = `BBF-${yy1}-${yy2}-`;

  const last = await prisma.invoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { date: "desc" },
    select: { number: true },
  });

  const nextSeq = last ? (parseInt(last.number.split("-").pop() || "0", 10) + 1) : 1;
  return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
}
