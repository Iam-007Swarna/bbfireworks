export function buildWhatsAppLink(number: string, text: string) {
  const num = number.replace(/[^\d]/g, "");
  const full = num.startsWith("91") ? num : `91${num}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}
