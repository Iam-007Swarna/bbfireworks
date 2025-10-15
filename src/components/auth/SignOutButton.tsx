"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <Button
      aria-label="Sign out"
      onClick={() => signOut({ callbackUrl: "/" })}
      size="sm"
      variant="ghost"
    >
      Sign out
    </Button>
  );
}
