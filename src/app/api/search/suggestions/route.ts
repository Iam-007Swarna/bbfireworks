import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";

// Cached search function with 5 minute TTL
const getCachedSuggestions = unstable_cache(
  async (query: string) => {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        visibleOnMarketplace: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        images: { select: { id: true }, take: 1 },
      },
      take: 8, // Limit to 8 suggestions
      orderBy: { name: "asc" },
    });
    return products;
  },
  ["search-suggestions"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["search-suggestions"],
  }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    // Normalize query for better cache hits
    const normalizedQuery = q.toLowerCase();
    const products = await getCachedSuggestions(normalizedQuery);

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
