"use client";

import { useState } from "react";
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
  const [unit, setUnit] = useState<"box" | "pack" | "piece">(
    defaultUnit ?? (allowPack ? "pack" : allowPiece ? "piece" : "box")
  );
  const [qty, setQty] = useState<number>(1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="input w-28"
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
      >
        Add to cart
      </Button>
      <a className="btn" href="/cart">View cart</a>
    </div>
  );
}
