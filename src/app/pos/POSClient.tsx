"use client";

import * as React from "react";
import type { POSItem } from "./actions";
import { finalizePOS } from "./actions";
import { toPieces, Unit } from "@/lib/units";

type Row = {
  productId: string;
  unit: Unit;
  qty: number;
  pricePerUnit: number;       // prefilled from retail price, editable
  costPerUnit: number | null; // optional display (kept null here)
  name: string;
  stockPieces: number;
  piecesPerPack: number;
  packsPerBox: number;
  allow: { box: boolean; pack: boolean; piece: boolean };
  price: { box: number | null; pack: number | null; piece: number | null };
  availableBoxes: number;
  availablePacks: number;
  availablePieces: number;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function POSClient({ initial }: { initial: POSItem[] }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [search, setSearch] = React.useState("");

  function addProduct(productId: string, unit: Unit) {
    const p = initial.find((x) => x.id === productId);
    if (!p) return;

    const price =
      unit === "box" ? p.price.box ?? 0 : unit === "pack" ? p.price.pack ?? 0 : p.price.piece ?? 0;

    const costPerUnit: number | null = null; // hook up avg cost later if needed

    setRows((r) => [
      ...r,
      {
        productId: p.id,
        unit,
        qty: 1,
        pricePerUnit: price,
        costPerUnit,
        name: p.name,
        stockPieces: p.stockPieces,
        piecesPerPack: p.piecesPerPack,
        packsPerBox: p.packsPerBox,
        allow: p.allow,
        price: p.price,
        availableBoxes: p.availableBoxes,
        availablePacks: p.availablePacks,
        availablePieces: p.availablePieces,
      },
    ]);
  }

  const subtotal = rows.reduce((a, r) => a + r.qty * r.pricePerUnit, 0);
  const profit = rows.reduce(
    (a, r) => a + (r.costPerUnit == null ? 0 : (r.pricePerUnit - r.costPerUnit) * r.qty),
    0
  );

  const hasInsufficient = rows.some(
    (r) => r.stockPieces < toPieces(r.qty, r.unit, r.piecesPerPack, r.packsPerBox)
  );
  const hasInvalid = rows.some((r) => r.qty <= 0 || r.pricePerUnit < 0);

  const filteredProducts = initial.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Product Search Section */}
      <div className="card">
        <label className="block text-sm font-medium mb-2">Search Products</label>
        <input
          className="input"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredProducts.slice(0, 12).map((p) => (
            <div key={p.id} className="card p-3">
              <div className="font-medium text-sm mb-1 truncate" title={p.name}>
                {p.name}
              </div>
              <div className="text-xs opacity-60 mb-2">SKU: {p.sku}</div>
              <div className="flex flex-wrap gap-1">
                {p.allow.box && p.price.box != null && p.availableBoxes > 0 && (
                  <button className="btn text-xs flex-1" onClick={() => addProduct(p.id, "box")}>
                    + Box
                  </button>
                )}
                {p.allow.pack && p.price.pack != null && p.availablePacks > 0 && (
                  <button className="btn text-xs flex-1" onClick={() => addProduct(p.id, "pack")}>
                    + Pack
                  </button>
                )}
                {p.allow.piece && p.price.piece != null && p.availablePieces > 0 && (
                  <button className="btn text-xs flex-1" onClick={() => addProduct(p.id, "piece")}>
                    + Piece
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 opacity-70">
            No products found. Try a different search term.
          </div>
        )}
      </div>

      {/* Cart/Invoice Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Current Invoice</h2>
        <p className="text-sm opacity-70 mb-4">
          {rows.length} {rows.length === 1 ? "item" : "items"} added
        </p>

        {rows.length === 0 ? (
          <div className="py-8 text-center opacity-70">
            Your cart is empty. Search and add products above.
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                    <th className="p-2 font-medium">Product</th>
                    <th className="p-2 font-medium">Quantity</th>
                    <th className="p-2 font-medium">Unit</th>
                    <th className="p-2 font-medium">Price/Unit</th>
                    <th className="p-2 font-medium">Total</th>
                    <th className="p-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const required = toPieces(r.qty, r.unit, r.piecesPerPack, r.packsPerBox);
                    const insufficient = r.stockPieces < required;
                    const lineTotal = r.qty * r.pricePerUnit;

                    return (
                      <tr
                        key={`${r.productId}-${i}`}
                        className={insufficient ? "opacity-70 bg-red-50 dark:bg-red-950/20" : ""}
                      >
                        <td className="p-2">
                          <div className="font-medium">{r.name}</div>
                          {insufficient && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              ⚠ Not enough stock (available: {r.stockPieces} pcs)
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="btn px-2 py-1 text-xs"
                              onClick={() => {
                                const newQty = Math.max(1, r.qty - 1);
                                setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, qty: newQty } : x)));
                              }}
                            >
                              −
                            </button>
                            <input
                              className="input w-16 text-center"
                              type="number"
                              min={1}
                              value={r.qty}
                              onChange={(e) => {
                                const v = Math.max(1, Number(e.target.value || "1"));
                                setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, qty: v } : x)));
                              }}
                            />
                            <button
                              type="button"
                              className="btn px-2 py-1 text-xs"
                              onClick={() => {
                                const newQty = r.qty + 1;
                                setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, qty: newQty } : x)));
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          <select
                            className="input"
                            value={r.unit}
                            onChange={(e) => {
                              const newUnit = e.target.value as Unit;
                              const newPrice =
                                newUnit === "box"
                                  ? r.price.box ?? 0
                                  : newUnit === "pack"
                                  ? r.price.pack ?? 0
                                  : r.price.piece ?? 0;
                              setRows((rs) =>
                                rs.map((x, idx) =>
                                  idx === i ? { ...x, unit: newUnit, pricePerUnit: newPrice } : x
                                )
                              );
                            }}
                          >
                            <option
                              value="box"
                              disabled={!r.allow.box || r.price.box == null || r.availableBoxes === 0}
                            >
                              Box
                            </option>
                            <option
                              value="pack"
                              disabled={!r.allow.pack || r.price.pack == null || r.availablePacks === 0}
                            >
                              Pack
                            </option>
                            <option
                              value="piece"
                              disabled={!r.allow.piece || r.price.piece == null || r.availablePieces === 0}
                            >
                              Piece
                            </option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            className="input w-24"
                            type="number"
                            step="0.01"
                            min={0}
                            value={r.pricePerUnit}
                            onChange={(e) =>
                              setRows((rs) =>
                                rs.map((x, idx) =>
                                  idx === i ? { ...x, pricePerUnit: Number(e.target.value || 0) } : x
                                )
                              )
                            }
                          />
                        </td>
                        <td className="p-2 font-medium">{inr.format(lineTotal)}</td>
                        <td className="p-2">
                          <button className="btn text-xs" onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Subtotal:</span>
                <span className="text-lg font-semibold">{inr.format(subtotal)}</span>
              </div>
              {profit !== 0 && (
                <div className="flex justify-between items-center mb-4 text-sm opacity-80">
                  <span>Estimated Profit:</span>
                  <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                    {inr.format(profit)}
                  </span>
                </div>
              )}

              <form action={finalizePOS} className="mt-6">
                <input type="hidden" name="cashierId" value="" />
                <JsonLinesWriter rows={rows} />

                {hasInsufficient && (
                  <div className="card bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 text-sm text-red-800 dark:text-red-200 text-center mb-4">
                    Cannot finalize: Some items have insufficient stock
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    className="btn border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent justify-center"
                    disabled={!rows.length || hasInsufficient || hasInvalid}
                  >
                    {hasInsufficient ? "Insufficient Stock" : "Finalize Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Hidden input that mirrors current rows -> JSON for the server action */
function JsonLinesWriter({ rows }: { rows: Row[] }) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const compact = rows.map((r) => ({
      productId: r.productId,
      unit: r.unit,
      qty: r.qty,
      pricePerUnit: r.pricePerUnit,
    }));
    ref.current.value = JSON.stringify(compact);
  }, [rows]);

  return <input ref={ref} type="hidden" name="lines" defaultValue="[]" />;
}