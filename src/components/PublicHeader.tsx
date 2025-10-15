"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function PublicHeader() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/admin" className="btn-sm">
          Admin
        </Link>
        <SignOutButton />
      </div>
    );
  }

  return (
    <Link href="/auth/login" className="btn-sm">
      Sign in
    </Link>
  );
}
