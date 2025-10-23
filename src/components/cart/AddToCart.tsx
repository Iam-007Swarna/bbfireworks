"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { addToCart } from "./useCart";
import { Button } from "@/components/ui/Button";

type Props = {
  productId: string;
  name: string;
  allowBox: boolean;
  allowPack: boolean;
  allowPiece: boolean;
  defaultUnit?: "box" | "pack" | "piece";
  availableBoxes?: number;
  availablePacks?: number;
  availablePieces?: number;
};

export default function AddToCart({
  productId,
  name,
  allowBox,
  allowPack,
  allowPiece,
  defaultUnit,
  availableBoxes = 999,
  availablePacks = 999,
  availablePieces = 999,
}: Props) {
  // Check if any unit is available
  const hasAnyUnit = allowBox || allowPack || allowPiece;

  const [unit, setUnit] = useState<"box" | "pack" | "piece">(
    defaultUnit ?? (allowPack ? "pack" : allowPiece ? "piece" : "box")
  );
  const [qty, setQty] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Get max quantity based on current unit
  const getMaxQuantity = () => {
    if (unit === "box") return availableBoxes;
    if (unit === "pack") return availablePacks;
    return availablePieces;
  };

  const maxQty = getMaxQuantity();

  // Reset quantity when unit changes if current qty exceeds new max
  useEffect(() => {
    if (qty > maxQty) {
      setQty(Math.min(qty, maxQty));
    }
  }, [unit, maxQty, qty]);

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
            className="input w-28 rounded-lg dark:bg-black dark:[&>option]:bg-black dark:[&>option]:rounded-lg"
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
        {/* Quantity control with plus/minus buttons */}
        <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <input
            className="w-16 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent outline-none py-2"
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => {
              const val = Number(e.target.value || "1");
              setQty(Math.max(1, Math.min(maxQty, val)));
            }}
          />
          <button
            type="button"
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            disabled={qty >= maxQty}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
        {maxQty < 999 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Max: {maxQty}
          </span>
        )}
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
