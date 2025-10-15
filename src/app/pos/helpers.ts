import type { Prisma } from "@prisma/client";

/**
 * Generate FY-based invoice number inside an existing transaction.
 * Requires a unique index on Invoice.number.
 *
 * Prisma model snippet:
 * model Invoice {
 *   id        String   @id @default(cuid())
 *   number    String   @unique
 *   date      DateTime @default(now())
 *   // ...
 * }
 */
export async function nextInvoiceNumberTx(tx: Prisma.TransactionClient) {
  const now = new Date();
  // Apr–Mar FY
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const yy1 = String(fyStartYear).slice(-2);
  const yy2 = String(fyStartYear + 1).slice(-2);
  const prefix = `BBF-${yy1}-${yy2}-`;

  // lexical desc works with zero-padded seq
  const last = await tx.invoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: [{ number: "desc" }],
    select: { number: true },
  });

  const nextSeq = last ? parseInt(last.number.split("-").pop() || "0", 10) + 1 : 1;
  return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
}