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
 * Fields are disabled only if the product doesn't allow selling in that unit.
 * Empty prices can still be edited to add new prices.
 */
export default function RowForm({ productId, channel, defaults, allow }: RowFormProps) {
  const prefix = channel === "marketplace" ? "mk" : "rt";

  return (
    <fieldset className="flex flex-col gap-1.5">
      <input
        id={`${prefix}_box_${productId}`}
        name={`${prefix}_box`}
        className="input text-sm py-1.5"
        type="number"
        step="0.01"
        min={0}
        placeholder={allow.box ? "Box ₹" : "Not allowed"}
        defaultValue={defaults.box ?? ""}
        disabled={!allow.box}
        title={!allow.box ? "Box sales not allowed for this product" : ""}
      />
      <input
        id={`${prefix}_pack_${productId}`}
        name={`${prefix}_pack`}
        className="input text-sm py-1.5"
        type="number"
        step="0.01"
        min={0}
        placeholder={allow.pack ? "Pack ₹" : "Not allowed"}
        defaultValue={defaults.pack ?? ""}
        disabled={!allow.pack}
        title={!allow.pack ? "Pack sales not allowed for this product" : ""}
      />
      <input
        id={`${prefix}_piece_${productId}`}
        name={`${prefix}_piece`}
        className="input text-sm py-1.5"
        type="number"
        step="0.0001"
        min={0}
        placeholder={allow.piece ? "Piece ₹" : "Not allowed"}
        defaultValue={defaults.piece ?? ""}
        disabled={!allow.piece}
        title={!allow.piece ? "Piece sales not allowed for this product" : ""}
      />
    </fieldset>
  );
}
