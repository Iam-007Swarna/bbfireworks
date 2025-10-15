"use client";

import ThemeToggle from "@/components/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 px-4 py-2">
      <div className="text-sm opacity-80">BB Fireworks · Admin</div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
