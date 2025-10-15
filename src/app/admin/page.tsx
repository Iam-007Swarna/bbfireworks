import { Card } from "@/components/ui/Card";

export default function AdminHome() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <h2 className="font-semibold mb-2">Quick Links</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><a className="underline" href="/admin/products">Manage Products</a></li>
          <li><a className="underline" href="/admin/purchases">Add Purchase</a></li>
          <li><a className="underline" href="/admin/pricing">Pricing</a></li>
          <li><a className="underline" href="/pos">Open POS</a></li>
        </ul>
      </Card>
      <Card className="p-4">
        <h2 className="font-semibold mb-2">Status</h2>
        <p className="text-sm opacity-80">
          You’re in the admin area. Use the sidebar to navigate across inventory, rates,
          purchases, pricing, orders, invoices, and settings.
        </p>
      </Card>
    </div>
  );
}
