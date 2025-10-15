"use client";

import * as React from "react";

type Product = {
  id: string;
  name: string;
  sku: string;
  piecesPerPack: number;
  packsPerBox: number;
};

type Row = {
  productId: string;
  qtyBoxes: number;
  qtyPacks: number;
  qtyPieces: number;
  unitCostPiece: number;
  taxPct: number;
};

export default function LinesBuilder({ products }: { products: Product[] }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const hiddenRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(rows);
  }, [rows]);

  if (!products.length) {
    return <div className="text-sm text-amber-600">No active products available. Add products first.</div>;
  }

  const addLine = () => {
    setRows((r) => [
      ...r,
      { productId: products[0].id, qtyBoxes: 0, qtyPacks: 0, qtyPieces: 0, unitCostPiece: 0, taxPct: 0 },
    ]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">Lines</span>
        <button type="button" className="btn" onClick={addLine}>
          + Add line
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-gray-400 p-4 border border-dashed rounded">
          No lines added yet. Click &quot;+ Add line&quot; to add purchase items.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="p-2">Product</th>
                <th className="p-2">Boxes</th>
                <th className="p-2">Packs</th>
                <th className="p-2">Pieces</th>
                <th className="p-2">Cost / Piece (₹)</th>
                <th className="p-2">Tax %</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
              const prod = products.find((p) => p.id === r.productId)!;
              const piecesFromBox = prod.packsPerBox * prod.piecesPerPack * r.qtyBoxes;
              const piecesFromPack = prod.piecesPerPack * r.qtyPacks;
              const totalPieces = piecesFromBox + piecesFromPack + r.qtyPieces;

              return (
                <tr key={i}>
                  <td className="p-2">
                    <select
                      className="input w-52 dark:bg-black dark:[&>option]:bg-black"
                      value={r.productId}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, productId: v } : x)));
                      }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </td>

                  {(["qtyBoxes", "qtyPacks", "qtyPieces"] as const).map((field) => (
                    <td className="p-2" key={field}>
                      <input
                        className="input w-24"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={r[field]}
                        onChange={(e) =>
                          setRows((rows) =>
                            rows.map((x, idx) =>
                              idx === i ? { ...x, [field]: Math.max(0, Math.trunc(Number(e.target.value || 0))) } : x,
                            ),
                          )
                        }
                      />
                    </td>
                  ))}

                  <td className="p-2">
                    <input
                      className="input w-28"
                      type="number"
                      min={0}
                      step="0.0001"
                      value={r.unitCostPiece}
                      onChange={(e) =>
                        setRows((rows) =>
                          rows.map((x, idx) => (idx === i ? { ...x, unitCostPiece: Number(e.target.value || 0) } : x)),
                        )
                      }
                    />
                  </td>

                  <td className="p-2">
                    <input
                      className="input w-24"
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={r.taxPct}
                      onChange={(e) =>
                        setRows((rows) => rows.map((x, idx) => (idx === i ? { ...x, taxPct: Number(e.target.value || 0) } : x)))
                      }
                    />
                  </td>

                  <td className="p-2">
                    <button type="button" className="btn" onClick={() => setRows((rows) => rows.filter((_, idx) => idx !== i))}>
                      Remove
                    </button>
                    <div className="text-xs opacity-70 mt-1">
                      Total pieces: <b>{totalPieces}</b>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <input ref={hiddenRef} type="hidden" id="lines-json" name="lines" defaultValue="[]" />
    </div>
  );
}
