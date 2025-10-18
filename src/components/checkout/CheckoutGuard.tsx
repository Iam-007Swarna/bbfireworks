"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

/**
 * Client-side guard that checks if cart is empty and redirects if needed
 */
export function CheckoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasItems, setHasItems] = useState(false);

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("bbf_cart") || "[]");
      if (cart.length === 0) {
        setHasItems(false);
      } else {
        setHasItems(true);
      }
    } catch {
      setHasItems(false);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="text-6xl opacity-20">🛒</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add some products to your cart before proceeding to checkout.
          </p>
        </div>
        <Link
          href="/"
          className="btn bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-700 inline-flex items-center gap-2"
        >
          <ShoppingBag size={18} />
          Browse Products
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
