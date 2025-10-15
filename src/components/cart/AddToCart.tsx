"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="input w-28 dark:bg-black dark:[&>option]:bg-black"
        value={unit}
        onChange={(e) => setUnit(e.target.value as "box" | "pack" | "piece")}
      >
        {allowBox && <option value="box">Box</option>}
        {allowPack && <option value="pack">Pack</option>}
        {allowPiece && <option value="piece">Piece</option>}
      </select>
      <input
        className="input w-24"
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value || "1")))}
      />
      <Button
        onClick={() => {
          addToCart({ productId, name, unit, qty });
        }}
        className="flex items-center gap-1.5"
      >
        <ShoppingCart size={16} />
        Add to cart
      </Button>
      <a className="btn flex items-center gap-1.5" href="/cart">
        <ShoppingCart size={16} />
        View cart
      </a>
    </div>
  );
}
