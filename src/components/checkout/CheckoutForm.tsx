"use client";

import { useState } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import CartToHidden from "@/app/(public)/checkout/CartToHidden";
import { useFormStatus } from "react-dom";

type FormErrors = {
  name?: string;
  phone?: string;
  address?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-700 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Place Order
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}

export function CheckoutForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [errors, setErrors] = useState<FormErrors>({});

  return (
    <form action={action} className="space-y-4">
      <CartToHidden />

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
            ✓
          </div>
          <span className="text-gray-600 dark:text-gray-400">Cart</span>
        </div>
        <div className="w-12 h-0.5 bg-blue-600"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            2
          </div>
          <span className="font-medium">Details</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-semibold">
            3
          </div>
          <span className="text-gray-400">Confirm</span>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          Customer Information
          <span className="text-xs text-gray-500 font-normal">* Required</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="sm:col-span-1">
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              className={`input ${errors.name ? "border-red-500 dark:border-red-500" : ""}`}
              name="name"
              placeholder="Enter your full name"
              required
              onChange={() => setErrors((prev) => ({ ...prev, name: undefined }))}
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={12} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className="sm:col-span-1">
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              className={`input ${errors.phone ? "border-red-500 dark:border-red-500" : ""}`}
              name="phone"
              type="tel"
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              required
              onChange={() => setErrors((prev) => ({ ...prev, phone: undefined }))}
            />
            {errors.phone && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={12} />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* Address Field */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium mb-1.5">
              Delivery Address{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="address"
              className="input"
              name="address"
              rows={3}
              placeholder="Enter delivery address or leave blank for store pickup"
            />
          </div>

          {/* Special Instructions */}
          <div className="sm:col-span-2">
            <label htmlFor="note" className="block text-sm font-medium mb-1.5">
              Special Instructions{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="note"
              className="input"
              name="note"
              rows={2}
              placeholder="Any special requests or delivery instructions"
            />
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
