import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildWhatsAppLink, formatWhatsAppOrderMessage } from "@/lib/whatsapp";
import { MessageCircle, Package, User, MapPin, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClearCart from "./ClearCart";

export default async function ConfirmOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/checkout");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      lines: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      customer: true,
    },
  });

  if (!order) {
    redirect("/checkout");
  }

  // Calculate subtotal
  const subtotal = order.lines.reduce(
    (sum, line) => sum + Number(line.pricePerUnit) * line.qty,
    0
  );

  // Build WhatsApp message
  const items = order.lines.map((line) => ({
    name: line.product.name,
    qty: line.qty,
    unit: line.unit,
    price: Number(line.pricePerUnit),
    total: Number(line.pricePerUnit) * line.qty,
  }));

  const message = formatWhatsAppOrderMessage({
    orderId: order.id,
    items,
    subtotal,
    name: order.customer?.name || "Guest",
    phone: order.customer?.phone || "",
    address: order.customer?.address || undefined,
    note: order.notes || undefined,
  });

  const waNumber = process.env.WHATSAPP_NUMBER || "9830463926";
  const whatsappLink = buildWhatsAppLink(waNumber, message);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ClearCart />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/checkout" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-semibold">Confirm Your Order</h1>
      </div>

      {/* Success message */}
      <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="text-green-600 dark:text-green-400 mt-0.5">
            <Package size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-green-900 dark:text-green-100">
              Order Created Successfully!
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Order ID: <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="card p-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Package size={18} />
          Order Summary
        </h2>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {order.lines.map((line) => {
            const lineTotal = Number(line.pricePerUnit) * line.qty;
            return (
              <div key={line.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{line.product.name}</div>
                    <div className="text-sm text-gray-500">
                      {line.qty} {line.unit} × ₹{Number(line.pricePerUnit).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold">₹{lineTotal.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
          <span className="font-semibold">Subtotal</span>
          <span className="text-lg font-bold">₹{subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Customer Details */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <User size={18} />
          Customer Details
        </h2>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="text-gray-500">Name:</span>
            <span className="font-medium">{order.customer?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-gray-400" />
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium">{order.customer?.phone}</span>
          </div>

          {order.customer?.address && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <span className="text-gray-500">Address:</span>
              <span className="font-medium flex-1">{order.customer.address}</span>
            </div>
          )}

          {order.notes && (
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-gray-400 mt-0.5" />
              <span className="text-gray-500">Note:</span>
              <span className="font-medium flex-1">{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
          📌 Important
        </h3>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>• Your order is reserved for 24 hours</li>
          <li>• Please send the message on WhatsApp to confirm</li>
          <li>• We&apos;ll process your order once confirmed</li>
          <li>• Stock will be deducted only after confirmation</li>
        </ul>
      </div>

      {/* WhatsApp Button */}
      <div className="sticky bottom-4 space-y-3">
        <a
          href={whatsappLink}
          className="btn btn-lg w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={20} />
          Send Order on WhatsApp
        </a>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
