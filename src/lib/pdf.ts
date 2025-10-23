// Import pdfkit - webpack alias handles the standalone version
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

type Line = { name: string; unit: "box"|"pack"|"piece"; qty: number; price: number; total: number };
type InvoiceData = {
  number: string;
  date: Date;
  customer?: { name: string; phone?: string; address?: string | null } | null;
  lines: Line[];
  subtotal: number;
  tax: number;
  roundOff: number;
  grand: number;
};

function currency(n: number, digits = 2) {
  return `₹${n.toFixed(digits)}`;
}

function makeDoc(data: InvoiceData, businessName: string, businessPhone?: string) {
  // A4 dimensions: 595.28 x 841.89 points
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50, // 50 points margin on all sides
    autoFirstPage: true,
    bufferPages: true
  });
  const chunks: Buffer[] = [];
  doc.on("data", (d: Buffer) => chunks.push(d));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Header
  doc.fontSize(18).text(businessName, { continued: false });
  doc.moveDown(0.25);
  if (businessPhone) doc.fontSize(10).fillColor("#444").text(`WhatsApp: ${businessPhone}`);
  doc.moveDown(0.5);
  doc.fillColor("#000").fontSize(12).text(`Invoice: ${data.number}`);
  doc.text(`Date: ${data.date.toLocaleDateString()}`);

  // Customer (optional)
  if (data.customer?.name) {
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Customer: ${data.customer.name}`);
    if (data.customer.phone) doc.text(`Phone: ${data.customer.phone}`);
    if (data.customer.address) doc.text(`Address: ${data.customer.address}`);
  }

  // Table header
  // A4 width: 595.28 - (50*2 margins) = 495.28 usable width
  doc.moveDown(0.75);
  const startX = doc.x;
  const pageWidth = 495; // Usable width within margins

  const col = {
    name: startX,
    unit: startX + 240,
    qty: startX + 305,
    price: startX + 365,
    total: startX + 440,
  };

  doc.fontSize(11).text("Firecracker", col.name, doc.y, { width: 230 });
  doc.text("Unit", col.unit, doc.y, { width: 55 });
  doc.text("Qty", col.qty, doc.y, { width: 50, align: "right" });
  doc.text("Price/Unit", col.price, doc.y, { width: 65, align: "right" });
  doc.text("Total", col.total, doc.y, { width: 55, align: "right" });

  doc.moveDown(0.2);
  const y0 = doc.y;
  doc.moveTo(startX, y0).lineTo(startX + pageWidth, y0).strokeColor("#ddd").stroke();
  doc.moveDown(0.2);

  // Lines
  data.lines.forEach((l) => {
    // Check if we need a new page (leave 150 points for footer and totals)
    if (doc.y > 700) {
      doc.addPage();
      // Re-draw table header on new page
      doc.fontSize(11).text("Firecracker", col.name, doc.y, { width: 230 });
      doc.text("Unit", col.unit, doc.y, { width: 55 });
      doc.text("Qty", col.qty, doc.y, { width: 50, align: "right" });
      doc.text("Price/Unit", col.price, doc.y, { width: 65, align: "right" });
      doc.text("Total", col.total, doc.y, { width: 55, align: "right" });
      doc.moveDown(0.2);
      const yHeader = doc.y;
      doc.moveTo(startX, yHeader).lineTo(startX + pageWidth, yHeader).strokeColor("#ddd").stroke();
      doc.moveDown(0.2);
    }

    const y = doc.y + 2;
    doc.fillColor("#000").fontSize(10);
    doc.text(l.name, col.name, y, { width: 230 });
    doc.text(l.unit, col.unit, y, { width: 55 });
    doc.text(String(l.qty), col.qty, y, { width: 50, align: "right" });
    doc.text(currency(l.price), col.price, y, { width: 65, align: "right" });
    doc.text(currency(l.total), col.total, y, { width: 55, align: "right" });
    doc.moveDown(0.2);
  });

  // Totals
  doc.moveDown(0.4);
  const y1 = doc.y;
  doc.moveTo(startX, y1).lineTo(startX + pageWidth, y1).strokeColor("#ddd").stroke();
  doc.moveDown(0.4);

  const rightX = startX + 295; // Adjusted for A4 width
  const row = (label: string, val: string) => {
    doc.fontSize(11).fillColor("#000").text(label, rightX, doc.y, { width: 100, align: "right" });
    doc.text(val, rightX + 110, doc.y, { width: 90, align: "right" });
  };

  row("Subtotal", currency(data.subtotal));
  row("Tax", currency(data.tax));
  row("Round off", currency(data.roundOff));
  doc.moveDown(0.2);
  row("Grand Total", currency(data.grand));

  // Footer
  doc.moveDown(1.2);
  doc.fontSize(9).fillColor("#666").text("Thank you for your purchase!", { align: "center" });
  doc.end();

  return done;
}

export async function generateInvoicePdfBuffer(invoiceId: string) {
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          customer: true,
          lines: {
            include: { product: { select: { name: true } } }
          }
        }
      }
    }
  });
  if (!inv) throw new Error("Invoice not found");
  if (!inv.order) throw new Error("Invoice missing order");

  type OrderLine = typeof inv.order.lines[number];

  const lines: Line[] = inv.order.lines.map((l: OrderLine) => {
    const total = Number(l.pricePerUnit) * l.qty;
    return {
      name: l.product.name,
      unit: l.unit as "box" | "pack" | "piece",
      qty: l.qty,
      price: Number(l.pricePerUnit),
      total,
    };
  });

  const data: InvoiceData = {
    number: inv.number,
    date: inv.date,
    customer: inv.order.customer
      ? {
          name: inv.order.customer.name,
          phone: inv.order.customer.phone,
          address: inv.order.customer.address,
        }
      : null,
    lines,
    subtotal: Number(inv.subtotal),
    tax: Number(inv.tax),
    roundOff: Number(inv.roundOff),
    grand: Number(inv.grand),
  };

  const appName = process.env.APP_NAME || "BB Fireworks, Nilganj";
  const wa = process.env.WHATSAPP_NUMBER;
  return await makeDoc(data, appName, wa);
}
