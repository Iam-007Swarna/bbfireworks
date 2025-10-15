"use client";
import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const base =
  "w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-700 min-h-[96px] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, className)} {...props} />
  )
);
Textarea.displayName = "Textarea";
