"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <Button
      aria-label="Sign out"
      onClick={() => signOut({ callbackUrl: "/" })}
      size="sm"
      variant="ghost"
      className="flex items-center gap-1.5"
    >
      <LogOut size={16} />
      Sign out
    </Button>
  );
}
