"use client";

import Link from "next/link";
import { Store } from "lucide-react";

export function MarketplaceLink() {
  return (
    <Link
      href="/"
      className="btn flex items-center gap-1.5"
      aria-label="Marketplace"
    >
      <Store size={18} />
    </Link>
  );
}
