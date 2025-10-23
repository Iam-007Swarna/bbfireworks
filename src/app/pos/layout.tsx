import type { ReactNode } from "react";
import Link from "next/link";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ToastProvider } from "@/components/ui/Toast";

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProviderWrapper>
      <ToastProvider>
        <div className="min-h-screen">
          <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-background z-10">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Billing Counter</h1>
                <p className="text-sm opacity-70 mt-1">
                  Search and add products to create an invoice
                </p>
              </div>
              <Link href="/admin" className="btn">
                ← Back to Admin
              </Link>
            </div>
          </header>
          <main className="p-4">{children}</main>
        </div>
      </ToastProvider>
    </SessionProviderWrapper>
  );
}
