"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { readCart } from "./useCart";

export function CartIcon() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Read cart on mount
    const updateCount = () => {
      const items = readCart();
      const total = items.reduce((sum, item) => sum + item.qty, 0);
      setItemCount(total);
    };

    updateCount();

    // Listen for storage changes (when cart is updated from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bbf_cart") {
        updateCount();
      }
    };

    // Listen for custom cart update events (when cart is updated in the same tab)
    const handleCartUpdate = () => {
      updateCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="btn flex items-center gap-1.5 relative"
      aria-label="View cart"
    >
      <ShoppingCart size={18} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
