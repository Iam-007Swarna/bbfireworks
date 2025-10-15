export type Unit = "box" | "pack" | "piece";

export function toPieces(
  qty: number,
  unit: Unit,
  piecesPerPack: number,
  packsPerBox: number
) {
  if (unit === "piece") return qty;
  if (unit === "pack") return qty * piecesPerPack;
  return qty * piecesPerPack * packsPerBox; // box
}
