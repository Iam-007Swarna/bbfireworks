import { NextRequest, NextResponse } from "next/server";
import {
  getCacheStats,
  refreshInventoryCache,
  clearInventoryCache,
} from "@/lib/inventoryCache";

/**
 * GET /api/inventory/cache - Get cache statistics
 */
export async function GET() {
  try {
    const stats = getCacheStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        cacheAgeMinutes: stats.cacheAge ? Math.floor(stats.cacheAge / 1000 / 60) : null,
        cacheAgeHours: stats.cacheAge ? (stats.cacheAge / 1000 / 60 / 60).toFixed(2) : null,
      },
    });
  } catch (error) {
    console.error("[API] Failed to get cache stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get cache stats",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/cache - Refresh or clear cache
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "refresh") {
      await refreshInventoryCache();
      const stats = getCacheStats();

      return NextResponse.json({
        success: true,
        message: "Cache refreshed successfully",
        stats,
      });
    } else if (action === "clear") {
      clearInventoryCache();

      return NextResponse.json({
        success: true,
        message: "Cache cleared successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Use 'refresh' or 'clear'",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API] Cache operation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cache operation failed",
      },
      { status: 500 }
    );
  }
}
