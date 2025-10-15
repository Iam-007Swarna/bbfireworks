"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Fallback copy failed:", err);
        alert("Failed to copy to clipboard. Please copy manually.");
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        className={`btn w-full flex items-center justify-center gap-2 transition-all ${
          copied
            ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
            : ""
        }`}
        disabled={copied}
      >
        {copied ? (
          <>
            <Check size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 font-medium">Copied to Clipboard!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            Copy Order Details
          </>
        )}
      </button>
    </div>
  );
}
