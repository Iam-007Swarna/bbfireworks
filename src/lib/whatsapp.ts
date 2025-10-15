export function buildWhatsAppLink(number: string, text: string) {
  const num = number.replace(/[^\d]/g, "");
  const full = num.startsWith("91") ? num : `91${num}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

type OrderItem = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
};

type OrderDetails = {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  name: string;
  phone: string;
  address?: string;
  note?: string;
};

export function formatWhatsAppOrderMessage(details: OrderDetails): string {
  const { orderId, items, subtotal, name, phone, address, note } = details;

  // Header with branding
  const header = [
    "🎆 *BB FIREWORKS, NILGANJ* 🎆",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ].join("\n");

  // Order details
  const orderInfo = [
    "📋 *NEW ORDER*",
    `🔖 Order ID: #${orderId.slice(-8).toUpperCase()}`,
    "",
  ].join("\n");

  // Items list
  const itemsList = [
    "🛒 *ITEMS:*",
    ...items.map((item, idx) => {
      const itemTotal = `₹${item.total.toFixed(2)}`;
      return `${idx + 1}. ${item.name}\n   ${item.qty} ${item.unit} × ₹${item.price.toFixed(2)} = *${itemTotal}*`;
    }),
    "",
  ].join("\n");

  // Pricing
  const pricing = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    `💰 *SUBTOTAL: ₹${subtotal.toFixed(2)}*`,
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ].join("\n");

  // Customer details
  const customerInfo = [
    "👤 *CUSTOMER DETAILS:*",
    `📛 Name: ${name}`,
    `📱 Phone: ${phone}`,
    `📍 ${address ? `Address: ${address}` : "Pickup from store"}`,
  ];

  if (note) {
    customerInfo.push(`📝 Note: ${note}`);
  }

  customerInfo.push("");

  const footer = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "⏰ *Please confirm this order*",
    "",
    "Thank you for choosing BB Fireworks! 🙏",
  ].join("\n");

  return [
    header,
    orderInfo,
    itemsList,
    pricing,
    customerInfo.join("\n"),
    footer,
  ].join("\n");
}
