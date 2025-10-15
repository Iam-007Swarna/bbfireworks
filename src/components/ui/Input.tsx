"use client";
import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

const base =
  "w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-700 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, className)} {...props} />
  )
);
Input.displayName = "Input";
