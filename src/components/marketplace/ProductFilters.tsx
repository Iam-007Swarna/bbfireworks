"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

type Props = {
  productCount: number;
};

export function ProductFilters({ productCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "name-asc";
  const currentStock = searchParams.get("stock") ?? "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <SlidersHorizontal size={16} />
        <span>
          {productCount} {productCount === 1 ? "product" : "products"} found
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Stock Filter */}
        <select
          name="stock"
          className="input w-auto text-sm py-1.5 rounded-lg dark:[&>option]:bg-black dark:[&>option]:rounded-lg"
          value={currentStock}
          onChange={(e) => updateFilter("stock", e.target.value)}
        >
          <option value="all">All Products</option>
          <option value="in-stock">In Stock Only</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        {/* Sort */}
        <select
          name="sort"
          className="input w-auto text-sm py-1.5 rounded-lg dark:[&>option]:bg-black dark:[&>option]:rounded-lg"
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>
    </div>
  );
}
