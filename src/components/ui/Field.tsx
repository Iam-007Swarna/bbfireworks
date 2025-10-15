import { ReactNode } from "react";
import { Label } from "./Label";

export function Field({
  label,
  children,
}: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
