"use client";

import { useFormStatus } from "react-dom";
import { MessageCircle, Loader2 } from "lucide-react";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Processing Order...
        </>
      ) : (
        <>
          <MessageCircle size={18} />
          Continue to Review Order
        </>
      )}
    </button>
  );
}
