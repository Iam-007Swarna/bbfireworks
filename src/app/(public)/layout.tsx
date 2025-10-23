import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { PublicHeader } from "@/components/PublicHeader";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { CartIcon } from "@/components/cart/CartIcon";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MarketplaceLink } from "@/components/MarketplaceLink";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between shadow-sm">
          <Link href="/" className="font-semibold hover:opacity-80">
            BB Fireworks
          </Link>
          <div className="flex items-center gap-2">
            <MarketplaceLink />
            <CartIcon />
            <ThemeToggle />
            <PublicHeader />
          </div>
        </header>
        <main className="container mx-auto p-4 flex-1">
          <Breadcrumbs />
          {children}
        </main>
        <Footer />
      </div>
    </SessionProviderWrapper>
  );
}
