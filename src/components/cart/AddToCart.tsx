"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { addToCart } from "./useCart";
import { Button } from "@/components/ui/Button";

type Props = {
  productId: string;
  name: string;
  allowBox: boolean;
  allowPack: boolean;
  allowPiece: boolean;
  defaultUnit?: "box" | "pack" | "piece";
};

export default function AddToCart({
  productId,
  name,
  allowBox,
  allowPack,
  allowPiece,
  defaultUnit,
}: Props) {
  // Check if any unit is available
  const hasAnyUnit = allowBox || allowPack || allowPiece;

  const [unit, setUnit] = useState<"box" | "pack" | "piece">(
    defaultUnit ?? (allowPack ? "pack" : allowPiece ? "piece" : "box")
  );
  const [qty, setQty] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // If no units are available (out of stock), show disabled state
  if (!hasAnyUnit) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-red-600 dark:text-red-400 font-medium">
          Out of Stock - Cannot add to cart
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ productId, name, unit, qty });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            className="input w-28 dark:bg-black dark:[&>option]:bg-black"
            value={unit}
            onChange={(e) => setUnit(e.target.value as "box" | "pack" | "piece")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {allowBox && <option value="box">Box</option>}
            {allowPack && <option value="pack">Pack</option>}
            {allowPiece && <option value="piece">Piece</option>}
          </select>
          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg z-10">
              <div className="font-semibold mb-1">Unit Selection:</div>
              {allowBox && <div>• Box: Multiple packs</div>}
              {allowPack && <div>• Pack: Multiple pieces</div>}
              {allowPiece && <div>• Piece: Individual item</div>}
            </div>
          )}
        </div>
        <input
          className="input w-24"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value || "1")))}
        />
        <Button
          onClick={handleAddToCart}
          className={`flex items-center gap-1.5 transition-all ${
            showSuccess
              ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
              : ""
          }`}
        >
          {showSuccess ? (
            <>
              <Check size={16} />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to cart
            </>
          )}
        </Button>
        {showSuccess && (
          <Link href="/cart" className="btn bg-blue-600 text-white hover:bg-blue-700 border-blue-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
            <ShoppingCart size={16} />
            View cart
          </Link>
        )}
      </div>

      {showSuccess && (
        <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
          <Check size={14} />
          <span>{qty} {unit}(s) of {name} added to cart</span>
        </div>
      )}
    </div>
  );
}
