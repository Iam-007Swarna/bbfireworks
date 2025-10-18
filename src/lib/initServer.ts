/**
 * Server initialization
 * This file runs once when the server starts
 */

import { initializeInventoryCache } from "./inventoryCache";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initializeServer() {
  // If already initialized, skip
  if (isInitialized) {
    console.log("[ServerInit] Already initialized, skipping...");
    return;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    console.log("[ServerInit] Initialization in progress, waiting...");
    await initPromise;
    return;
  }

  // Start initialization
  initPromise = (async () => {
    console.log("[ServerInit] Starting server initialization...");

    try {
      // Initialize inventory cache
      await initializeInventoryCache();

      isInitialized = true;
      console.log("[ServerInit] Server initialization complete!");
    } catch (error) {
      console.error("[ServerInit] Failed to initialize server:", error);
      // Don't throw - allow server to start even if cache fails
      // Cache will be initialized on first request
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
}

// Auto-initialize on module load, but skip during build time
// During build, Next.js spawns multiple workers, each triggering initialization
// The cache will be initialized on first runtime request instead
const isBuildTime = process.argv.includes('build') || process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildTime) {
  initializeServer().catch((error) => {
    console.error("[ServerInit] Auto-initialization error:", error);
  });
}
