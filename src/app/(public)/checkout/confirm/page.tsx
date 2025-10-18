import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildWhatsAppLink, formatWhatsAppOrderMessage } from "@/lib/whatsapp";
import { MessageCircle, Package, User, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import ClearCart from "./ClearCart";
import CopyButton from "./CopyButton";

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
    <div className="max-w-2xl mx-auto space-y-6 pb-40">
      <ClearCart />

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Order Confirmation</h1>
      </div>

      {/* Success message with animation */}
      <div className="card p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-start gap-3">
          <div className="text-green-600 dark:text-green-400 mt-0.5">
            <Package size={24} />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-green-900 dark:text-green-100">
              Order Created Successfully!
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Order ID: <span className="font-mono font-semibold">#{order.id.slice(-8).toUpperCase()}</span>
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

      {/* Important Notice - More Prominent */}
      <div className="card p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-100 mb-3">
              Important - Action Required!
            </h3>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">1.</span>
                <span><strong>Your order is reserved for 24 hours only</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">2.</span>
                <span><strong>Click the WhatsApp button below</strong> to confirm your order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">3.</span>
                <span>We&apos;ll process your order <strong>only after</strong> receiving your WhatsApp message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">4.</span>
                <span>Stock will be deducted after confirmation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom with better spacing */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t-2 border-gray-200 dark:border-gray-800 shadow-2xl z-50">
        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {/* Primary WhatsApp button - more prominent */}
          <a
            href={whatsappLink}
            className="btn w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg py-4 text-base font-semibold border-green-600 hover:shadow-xl transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={22} />
            Send Order on WhatsApp
          </a>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            <span>OR</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <CopyButton text={message} />

          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            If WhatsApp doesn&apos;t open, copy the order details and send manually to{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{waNumber}</span>
          </p>

          <div className="text-center pt-1 border-t border-gray-200 dark:border-gray-800 mt-2">
            <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400 font-medium">
              Browse More Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
