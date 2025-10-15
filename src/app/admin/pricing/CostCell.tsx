"use client";

import { useEditMode } from "./PricingClient";
import { useState } from "react";

type Props = {
  productId: string;
  cPiece: number | null;
  cPack: number | null;
  cBox: number | null;
  piecesPerPack: number;
  packsPerBox: number;
  onCostChange: (productId: string, newCostPiece: number | null) => void;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

function fmtMoney(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  // For tiny piece prices, show both currency and fixed if helpful
  if (digits > 2) return `${inr.format(n)} (${n.toFixed(digits)})`;
  return inr.format(n);
}

export default function CostCell({ productId, cPiece, cPack, cBox, piecesPerPack, packsPerBox, onCostChange }: Props) {
  const editMode = useEditMode();
  const [editedCostPiece, setEditedCostPiece] = useState<number | null>(cPiece);

  const handleCostChange = (value: string) => {
    const num = value.trim() === "" ? null : Number(value);
    const validNum = num !== null && Number.isFinite(num) && num >= 0 ? num : null;
    setEditedCostPiece(validNum);
    onCostChange(productId, validNum);
  };

  if (editMode) {
    const calculatedPack = editedCostPiece !== null ? editedCostPiece * piecesPerPack : null;
    const calculatedBox = editedCostPiece !== null ? editedCostPiece * piecesPerPack * packsPerBox : null;

    return (
      <div className="space-y-1.5">
        <div className="text-xs opacity-70">piece:</div>
        <input
          type="number"
          step="0.0001"
          className="input text-sm py-1 w-28"
          value={editedCostPiece ?? ""}
          onChange={(e) => handleCostChange(e.target.value)}
          placeholder="₹"
        />
        <div className="text-xs opacity-70 mt-2">pack (calculated):</div>
        <div className="text-sm font-medium">
          {fmtMoney(calculatedPack)}
        </div>
        <div className="text-xs opacity-70 mt-2">box (calculated):</div>
        <div className="text-sm font-medium">
          {fmtMoney(calculatedBox)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="opacity-80">piece: <b>{fmtMoney(cPiece, 4)}</b></div>
      <div className="opacity-80">pack: <b>{fmtMoney(cPack)}</b></div>
      <div className="opacity-80">box: <b>{fmtMoney(cBox)}</b></div>
    </div>
  );
}
