import type { ReactNode } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { PublicHeader } from "@/components/PublicHeader";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProviderWrapper>
      <header className="border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
        <Link href="/" className="font-semibold hover:opacity-80">
          BB Fireworks
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/cart" className="btn flex items-center gap-1.5" aria-label="View cart">
            <ShoppingCart size={18} />
          </Link>
          <ThemeToggle />
          <PublicHeader />
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
    </SessionProviderWrapper>
  );
}
