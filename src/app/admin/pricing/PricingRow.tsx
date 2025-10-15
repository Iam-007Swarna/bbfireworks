"use client";

import { useState } from "react";
import CostCell from "./CostCell";
import RowForm from "./RowForm";
import { saveRow, saveCost } from "./actions";
import { useEditMode } from "./PricingClient";
import { Save, AlertCircle } from "lucide-react";

type Props = {
  product: {
    id: string;
    name: string;
    sku: string;
    piecesPerPack: number;
    packsPerBox: number;
    allowSellBox: boolean;
    allowSellPack: boolean;
    allowSellPiece: boolean;
  };
  cPiece: number | null;
  cPack: number | null;
  cBox: number | null;
  mkBox: number | null;
  mkPack: number | null;
  mkPiece: number | null;
  rtBox: number | null;
  rtPack: number | null;
  rtPiece: number | null;
};

export default function PricingRow({
  product: p,
  cPiece: initialCPiece,
  cPack: initialCPack,
  cBox: initialCBox,
  mkBox,
  mkPack,
  mkPiece,
  rtBox,
  rtPack,
  rtPiece,
}: Props) {
  const editMode = useEditMode();
  const [modifiedCost, setModifiedCost] = useState<number | null>(null);
  const [isCostChanged, setIsCostChanged] = useState(false);
  const [savingCost, setSavingCost] = useState(false);

  // Use modified cost if available, otherwise use initial
  const cPiece = modifiedCost !== null ? modifiedCost : initialCPiece;
  const cPack = cPiece !== null ? cPiece * p.piecesPerPack : null;
  const cBox = cPiece !== null ? cPiece * p.piecesPerPack * p.packsPerBox : null;

  const handleCostChange = (productId: string, newCostPiece: number | null) => {
    setModifiedCost(newCostPiece);
    setIsCostChanged(newCostPiece !== initialCPiece);
  };

  const handleSaveCost = async () => {
    if (modifiedCost === null) return;

    setSavingCost(true);
    try {
      const formData = new FormData();
      formData.append("productId", p.id);
      formData.append("costPerPiece", modifiedCost.toString());

      await saveCost(formData);
      setIsCostChanged(false);
    } catch (error) {
      console.error("Failed to save cost:", error);
    } finally {
      setSavingCost(false);
    }
  };

  const marginPct = (sell: number | null, cost: number | null) => {
    if (sell == null || cost == null || sell <= 0) return "—";
    const m = ((sell - cost) / sell) * 100;
    return `${m.toFixed(1)}%`;
  };

  return (
    <tr className="align-top">
      <td className="p-2">{p.name}</td>
      <td className="p-2">{p.sku}</td>

      <td className="p-2">
        <div className="flex items-start gap-2">
          <CostCell
            productId={p.id}
            cPiece={initialCPiece}
            cPack={initialCPack}
            cBox={initialCBox}
            piecesPerPack={p.piecesPerPack}
            packsPerBox={p.packsPerBox}
            onCostChange={handleCostChange}
          />
          {editMode && isCostChanged && (
            <button
              onClick={handleSaveCost}
              disabled={savingCost}
              className="btn p-1.5 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center"
              title="Save cost changes"
            >
              {savingCost ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <AlertCircle size={16} />
              )}
            </button>
          )}
        </div>
      </td>

      <td className="p-2">
        <div className="space-y-0.5 text-xs">
          <div>box: <span className="font-medium">{marginPct(mkBox, cBox)}</span></div>
          <div>pack: <span className="font-medium">{marginPct(mkPack, cPack)}</span></div>
          <div>piece: <span className="font-medium">{marginPct(mkPiece, cPiece)}</span></div>
        </div>
      </td>

      <td className="p-2" colSpan={3}>
        <form action={saveRow} className="flex gap-3 items-end">
          <input type="hidden" name="productId" value={p.id} />

          <div className="flex-1">
            <div className="text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Marketplace</div>
            <RowForm
              productId={p.id}
              channel="marketplace"
              defaults={{ box: mkBox, pack: mkPack, piece: mkPiece }}
              allow={{ box: p.allowSellBox, pack: p.allowSellPack, piece: p.allowSellPiece }}
            />
          </div>

          <div className="flex-1">
            <div className="text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Retail</div>
            <RowForm
              productId={p.id}
              channel="retail"
              defaults={{ box: rtBox, pack: rtPack, piece: rtPiece }}
              allow={{ box: p.allowSellBox, pack: p.allowSellPack, piece: p.allowSellPiece }}
            />
          </div>

          <button
            type="submit"
            className="btn px-3 py-2 flex items-center justify-center"
            title="Save pricing"
          >
            <Save size={16} />
          </button>
        </form>
      </td>
    </tr>
  );
}
