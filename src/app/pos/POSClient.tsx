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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">Billing Counter</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Search and add products to create an invoice
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Product Search Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium mb-2">Search Products</label>
            <input
              className="input w-full"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {initial
                .filter(
                  (p) =>
                    !search ||
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.sku.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 12)
                .map((p) => (
                  <div
                    key={p.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="font-medium text-sm mb-1 truncate" title={p.name}>
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      SKU: {p.sku}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.allow.box && (
                        <button
                          className="btn text-xs flex-1"
                          onClick={() => addProduct(p.id, "box")}
                        >
                          + Box
                        </button>
                      )}
                      {p.allow.pack && (
                        <button
                          className="btn text-xs flex-1"
                          onClick={() => addProduct(p.id, "pack")}
                        >
                          + Pack
                        </button>
                      )}
                      {p.allow.piece && (
                        <button
                          className="btn text-xs flex-1"
                          onClick={() => addProduct(p.id, "piece")}
                        >
                          + Piece
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            {initial.filter(
              (p) =>
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No products found. Try a different search term.
              </div>
            )}
          </div>
        </div>

        {/* Cart/Invoice Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Current Invoice</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {rows.length} {rows.length === 1 ? "item" : "items"} added
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Your cart is empty. Search and add products above.
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left">
                    <th className="p-3 font-medium">Product</th>
                    <th className="p-3 font-medium">Quantity</th>
                    <th className="p-3 font-medium">Unit</th>
                    <th className="p-3 font-medium">Price/Unit</th>
                    <th className="p-3 font-medium">Total</th>
                    <th className="p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {rows.map((r, i) => {
                    const required = toPieces(r.qty, r.unit, r.piecesPerPack, r.packsPerBox);
                    const insufficient = r.stockPieces < required;
                    const lineTotal = r.qty * r.pricePerUnit;

                    return (
                      <tr key={`${r.productId}-${i}`} className={insufficient ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <td className="p-3">
                          <div className="font-medium">{r.name}</div>
                          {insufficient && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              ⚠ Not enough stock (available: {r.stockPieces} pieces)
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            className="input w-20"
                            type="number"
                            min={1}
                            value={r.qty}
                            onChange={(e) => {
                              const v = Math.max(1, Number(e.target.value || "1"));
                              setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, qty: v } : x)));
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className="input"
                            value={r.unit}
                            onChange={(e) =>
                              setRows((rs) =>
                                rs.map((x, idx) =>
                                  idx === i ? { ...x, unit: e.target.value as Unit } : x
                                )
                              )
                            }
                          >
                            <option value="box">Box</option>
                            <option value="pack">Pack</option>
                            <option value="piece">Piece</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            className="input w-28"
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
                        <td className="p-3 font-medium">{inr.format(lineTotal)}</td>
                        <td className="p-3">
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                            onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoice Summary & Actions */}
          {rows.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-lg font-semibold">{inr.format(subtotal)}</span>
                </div>
                {profit !== 0 && (
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Profit:</span>
                    <span className={`text-lg font-semibold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {inr.format(profit)}
                    </span>
                  </div>
                )}

                <form action={finalizePOS} className="space-y-3">
                  <input type="hidden" name="cashierId" value="" />
                  <JsonLinesWriter rows={rows} />

                  {hasInsufficient && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-800 dark:text-red-200">
                      Cannot finalize: Some items have insufficient stock
                    </div>
                  )}

                  <button
                    className="btn w-full py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                    disabled={!rows.length || hasInsufficient || hasInvalid}
                  >
                    {hasInsufficient ? "Insufficient Stock" : "Finalize Invoice"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
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