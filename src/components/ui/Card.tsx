import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border rounded bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}
