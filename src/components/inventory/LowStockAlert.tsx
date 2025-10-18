import { AlertTriangle, Package } from "lucide-react";

type LowStockAlertProps = {
  availableBoxes: number;
  availablePacks: number;
  availablePieces: number;
  piecesPerPack: number;
  packsPerBox: number;
  threshold?: number; // Alert if any unit type has less than this
  showDetails?: boolean;
};

export function LowStockAlert({
  availableBoxes,
  availablePacks,
  availablePieces,
  piecesPerPack,
  packsPerBox,
  threshold = 10,
  showDetails = true,
}: LowStockAlertProps) {
  // Check if any unit type is below threshold
  const isLowBox = availableBoxes > 0 && availableBoxes < threshold;
  const isLowPack = availablePacks > 0 && availablePacks < threshold;
  const isLowPiece = availablePieces > 0 && availablePieces < threshold;

  const hasLowStock = isLowBox || isLowPack || isLowPiece;

  if (!hasLowStock) {
    return null;
  }

  // Build alert message
  const lowStockItems: string[] = [];
  if (isLowBox) {
    lowStockItems.push(`${availableBoxes} ${availableBoxes === 1 ? "box" : "boxes"}`);
  }
  if (isLowPack) {
    lowStockItems.push(`${availablePacks} ${availablePacks === 1 ? "pack" : "packs"}`);
  }
  if (isLowPiece) {
    lowStockItems.push(`${availablePieces} ${availablePieces === 1 ? "piece" : "pieces"}`);
  }

  return (
    <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 animate-pulse" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <Package size={18} />
            Low Stock Alert
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
            Only <strong>{lowStockItems.join(", ")}</strong> remaining!
          </p>
          {showDetails && (
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
              This item is selling fast. Order now to avoid disappointment.
            </p>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-4 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-1">
              <span className="font-semibold">Available:</span>
            </div>
            {availableBoxes > 0 && (
              <div className={isLowBox ? "font-bold" : ""}>
                {availableBoxes} {availableBoxes === 1 ? "box" : "boxes"}
                <span className="text-amber-600 dark:text-amber-400 ml-1">
                  ({packsPerBox} packs/box)
                </span>
              </div>
            )}
            {availablePacks > 0 && (
              <div className={isLowPack ? "font-bold" : ""}>
                {availablePacks} {availablePacks === 1 ? "pack" : "packs"}
                <span className="text-amber-600 dark:text-amber-400 ml-1">
                  ({piecesPerPack} pcs/pack)
                </span>
              </div>
            )}
            {availablePieces > 0 && (
              <div className={isLowPiece ? "font-bold" : ""}>
                {availablePieces} {availablePieces === 1 ? "piece" : "pieces"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
