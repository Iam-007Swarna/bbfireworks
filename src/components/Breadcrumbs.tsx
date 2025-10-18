"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage
  if (pathname === "/") return null;

  const paths = pathname.split("/").filter(Boolean);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
  ];

  // Build breadcrumb trail
  let currentPath = "";
  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format label
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Special cases
    if (segment === "products" && paths[index + 1]) {
      label = "Products";
    } else if (paths[index - 1] === "products") {
      // Product ID - we'll just show "Product Details"
      label = "Product Details";
    } else if (segment === "cart") {
      label = "Shopping Cart";
    } else if (segment === "checkout") {
      label = "Checkout";
    } else if (segment === "confirm") {
      label = "Confirmation";
    }

    breadcrumbItems.push({
      label,
      href: currentPath,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
              {isLast ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home size={14} />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
