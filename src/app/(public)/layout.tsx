import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { auth } from "@/auth.config";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
        <Link href="/" className="font-semibold hover:opacity-80">
          BB Fireworks
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/admin" className="btn-sm">
                Admin
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/auth/login" className="btn-sm">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
    </>
  );
}
