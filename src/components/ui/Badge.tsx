import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
}
