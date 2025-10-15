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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Billing Counter</h1>

      {/* Quick add */}
      <div className="card p-3 flex flex-wrap gap-2 items-center">
        <input
          className="input w-64"
          placeholder="Search product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {initial
            .filter(
              (p) =>
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase())
            )
            .slice(0, 8)
            .map((p) => (
              <div key={p.id} className="flex gap-1 items-center">
                <span className="text-xs">{p.name}</span>
                {p.allow.box && (
                  <button className="btn text-xs" onClick={() => addProduct(p.id, "box")}>
                    + Box
                  </button>
                )}
                {p.allow.pack && (
                  <button className="btn text-xs" onClick={() => addProduct(p.id, "pack")}>
                    + Pack
                  </button>
                )}
                {p.allow.piece && (
                  <button className="btn text-xs" onClick={() => addProduct(p.id, "piece")}>
                    + Piece
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Lines table */}
      <div className="overflow-auto">
        <table className="min-w-[900px] text-sm">
          <thead className="text-left sticky top-0 bg-white dark:bg-black">
            <tr>
              <th className="p-2">Firecracker</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Price/Unit (₹)</th>
              <th className="p-2">Cost/Unit (₹)</th>
              <th className="p-2">Total (₹)</th>
              <th className="p-2">Profit (₹)</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const required = toPieces(r.qty, r.unit, r.piecesPerPack, r.packsPerBox);
              const insufficient = r.stockPieces < required;

              return (
                <tr key={`${r.productId}-${i}`} className={insufficient ? "opacity-70" : ""}>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">
                    <input
                      className="input w-24"
                      type="number"
                      min={1}
                      value={r.qty}
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value || "1"));
                        setRows((rs) => rs.map((x, idx) => (idx === i ? { ...x, qty: v } : x)));
                      }}
                    />
                    {insufficient && (
                      <div className="text-xs text-red-600 mt-1">Not enough stock</div>
                    )}
                  </td>
                  <td className="p-2">
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
                  <td className="p-2">
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
                  <td className="p-2">
                    {r.costPerUnit == null
                      ? "—"
                      : r.costPerUnit.toFixed(r.unit === "piece" ? 4 : 2)}
                  </td>
                  <td className="p-2">{(r.qty * r.pricePerUnit).toFixed(2)}</td>
                  <td className="p-2">
                    {r.costPerUnit == null
                      ? "—"
                      : (r.qty * (r.pricePerUnit - r.costPerUnit)).toFixed(2)}
                  </td>
                  <td className="p-2">
                    <button
                      className="btn"
                      onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-2 text-sm opacity-70" colSpan={8}>
                  Use the search above to add items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form action={finalizePOS} className="card p-3 flex flex-wrap gap-4 items-center">``
        <input type="hidden" name="cashierId" value="" />
        <JsonLinesWriter rows={rows} />
        <div>
          Subtotal: <b>{inr.format(subtotal)}</b>
        </div>
        <div>
          Profit (approx):{" "}
          <b className={profit >= 0 ? "text-green-600" : "text-red-600"}>
            {inr.format(profit)}
          </b>
        </div>
        <button className="btn" disabled={!rows.length || hasInsufficient || hasInvalid}>
          Finalize Invoice
        </button>
      </form>
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