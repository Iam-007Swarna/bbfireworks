"use client";

import { useState, useTransition } from "react";
import { Copy, MessageCircle, X } from "lucide-react";

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

type FulfillOrderButtonProps = {
  orderId: string;
  fulfillOrder: (formData: FormData) => Promise<FulfillmentResult>;
};

export function FulfillOrderButton({ orderId, fulfillOrder }: FulfillOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<FulfillmentResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await fulfillOrder(formData);
      setResult(res);
      if (!res.success && res.outOfStockItems) {
        setShowDialog(true);
      }
    });
  };

  const generateWhatsAppMessage = () => {
    if (!result?.outOfStockItems || !result.customerName) return "";

    const items = result.outOfStockItems.map((item) => {
      const shortage = item.needed - item.available;
      return `• ${item.productName} (${item.sku}): Need ${item.needed} ${item.unit}, only ${item.available} ${item.unit} available (short by ${shortage})`;
    }).join("\n");

    return `Hello ${result.customerName},

We regret to inform you that some items in your order are currently out of stock or not available in the requested quantity:

${items}

We apologize for the inconvenience. Please let us know if you would like to:
1. Wait until the items are restocked
2. Modify your order to available quantities
3. Cancel the affected items

Please reply with your preference, and we'll be happy to assist you.

Thank you for your understanding.

BB Fireworks`;
  };

  const copyToClipboard = async () => {
    const message = generateWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openWhatsApp = () => {
    if (!result?.customerPhone) return;
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const phone = result.customerPhone.replace(/\D/g, ""); // Remove non-digits
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          className="btn"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Processing..." : "Fulfill & Generate Invoice"}
        </button>
      </form>

      {showDialog && result?.outOfStockItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                Out of Stock Items
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-auto p-4 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The following items cannot be fulfilled due to insufficient stock:
              </p>

              <div className="space-y-2">
                {result.outOfStockItems.map((item, idx) => {
                  const shortage = item.needed - item.available;
                  return (
                    <div
                      key={idx}
                      className="p-3 border border-red-200 dark:border-red-900 rounded bg-red-50 dark:bg-red-950/20"
                    >
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {item.sku}
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-red-600 dark:text-red-400">
                          Needed: {item.needed} {item.unit}
                        </span>
                        {" | "}
                        <span className="text-orange-600 dark:text-orange-400">
                          Available: {item.available} {item.unit}
                        </span>
                        {" | "}
                        <span className="font-medium text-red-700 dark:text-red-300">
                          Short by: {shortage} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {result.customerPhone && (
                <div className="p-3 border border-blue-200 dark:border-blue-900 rounded bg-blue-50 dark:bg-blue-950/20">
                  <div className="font-medium mb-1">Customer Details</div>
                  <div className="text-sm">
                    Name: {result.customerName}
                  </div>
                  <div className="text-sm">
                    WhatsApp: +91 {result.customerPhone}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="font-medium text-sm">WhatsApp Message:</div>
                <textarea
                  readOnly
                  value={generateWhatsAppMessage()}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-sm font-mono h-64"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={copyToClipboard}
                  className="btn flex items-center gap-2"
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                {result.customerPhone && (
                  <button
                    onClick={openWhatsApp}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Open WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
