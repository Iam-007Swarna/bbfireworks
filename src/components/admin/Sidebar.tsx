"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  ShoppingBag,
  Boxes,
  Tag,
  ShoppingCart,
  FileText,
  Palette,
  Settings,
  CreditCard,
  Store,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Marketplace", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/rates", label: "Rates", icon: DollarSign },
  { href: "/admin/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/pricing", label: "Pricing", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/design", label: "Design", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/pos", label: "Billing Counter (POS)", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="p-3 sticky top-0 h-screen flex flex-col">
      <div>
        <div className="mb-3 font-semibold text-sm opacity-80">Admin</div>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                    active && "bg-gray-100 dark:bg-gray-800 font-medium"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Info Section */}
      {session?.user && (
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-2 px-3 py-2 rounded bg-gray-50 dark:bg-gray-900">
            <div className="flex-shrink-0 mt-0.5">
              <User size={16} className="opacity-60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{session.user.name}</div>
              <div className="text-xs opacity-60 truncate">{session.user.email}</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
