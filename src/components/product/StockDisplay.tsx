import { Package, Clock } from "lucide-react";
import { formatTimeShort } from "@/lib/date";

type StockDisplayProps = {
  availableBoxes: number;
  availablePacks: number;
  availablePieces: number;
  piecesPerPack: number;
  packsPerBox: number;
  compact?: boolean;
  lastUpdated?: Date;
};

export function StockDisplay({
  availableBoxes,
  availablePacks,
  availablePieces,
  piecesPerPack,
  packsPerBox,
  compact = false,
  lastUpdated,
}: StockDisplayProps) {
  const hasStock = availableBoxes > 0 || availablePacks > 0 || availablePieces > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {hasStock ? (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-700 dark:text-green-400 font-medium">
              In Stock
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-700 dark:text-red-400 font-medium">
              Out of Stock
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="card p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Package size={16} />
        <span>Available Stock</span>
      </div>

      {hasStock ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {availableBoxes > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Boxes</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {availableBoxes}
                </span>
                <span className="text-xs text-gray-400">
                  ({packsPerBox} packs/box)
                </span>
              </div>
            )}

            {availablePacks > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Packs</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {availablePacks}
                </span>
                <span className="text-xs text-gray-400">
                  ({piecesPerPack} pcs/pack)
                </span>
              </div>
            )}

            {availablePieces > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Pieces</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {availablePieces}
                </span>
              </div>
            )}
          </div>

          {lastUpdated && (
            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                <span>
                  Updated: {formatTimeShort(lastUpdated)}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-red-600 dark:text-red-400 font-medium">
          Currently out of stock
        </div>
      )}
    </div>
  );
}
