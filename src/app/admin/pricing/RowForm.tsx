"use client";

type RowFormProps = {
  productId: string;
  channel: "marketplace" | "retail";
  defaults: { box: number | null; pack: number | null; piece: number | null };
  allow: { box: boolean; pack: boolean; piece: boolean };
};

/**
 * Fieldset with three inputs for a channel; names are posted directly to the server action form.
 * We keep IDs unique per product so label/UX remain nice if you later add labels.
 */
export default function RowForm({ productId, channel, defaults, allow }: RowFormProps) {
  const prefix = channel === "marketplace" ? "mk" : "rt";
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <input
        id={`${prefix}_box_${productId}`}
        name={`${prefix}_box`}
        className="input"
        type="number"
        step="0.01"
        min={0}
        placeholder="Box ₹"
        defaultValue={defaults.box ?? ""}
        disabled={!allow.box}
      />
      <input
        id={`${prefix}_pack_${productId}`}
        name={`${prefix}_pack`}
        className="input"
        type="number"
        step="0.01"
        min={0}
        placeholder="Pack ₹"
        defaultValue={defaults.pack ?? ""}
        disabled={!allow.pack}
      />
      <input
        id={`${prefix}_piece_${productId}`}
        name={`${prefix}_piece`}
        className="input"
        type="number"
        step="0.0001"
        min={0}
        placeholder="Piece ₹"
        defaultValue={defaults.piece ?? ""}
        disabled={!allow.piece}
      />
    </fieldset>
  );
}
