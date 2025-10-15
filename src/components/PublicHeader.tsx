"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldCheck, LogIn } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function PublicHeader() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/admin" className="btn-sm flex items-center gap-1.5">
          <ShieldCheck size={16} />
          Admin
        </Link>
        <SignOutButton />
      </div>
    );
  }

  return (
    <Link href="/auth/login" className="btn-sm flex items-center gap-1.5">
      <LogIn size={16} />
      Sign in
    </Link>
  );
}
