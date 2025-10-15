"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/rates", label: "Rates" },
  { href: "/admin/purchases", label: "Purchases" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/design", label: "Design" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/pos", label: "Billing Counter (POS)" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="p-3 sticky top-0">
      <div className="mb-3 font-semibold text-sm opacity-80">Admin</div>
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                  active && "bg-gray-100 dark:bg-gray-800 font-medium"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
