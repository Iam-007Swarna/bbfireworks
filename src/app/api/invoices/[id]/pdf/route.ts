import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer } from "@/lib/pdf";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { pdfBytes: true, pdfMime: true },
  });
  let pdf = invoice?.pdfBytes ?? null;
  let mime = invoice?.pdfMime ?? "application/pdf";

  // If missing or empty, generate on the fly and persist
  if (!pdf || pdf.length === 0) {
    const buf = await generateInvoicePdfBuffer(id);
    await prisma.invoice.update({
      where: { id },
      data: { pdfBytes: buf, pdfMime: "application/pdf" },
    });
    pdf = buf;
    mime = "application/pdf";
  }

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
