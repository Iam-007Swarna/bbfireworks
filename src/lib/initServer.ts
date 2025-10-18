/**
 * Server initialization
 * This file runs once when the server starts
 */

import { initializeInventoryCache } from "./inventoryCache";

let isInitialized = false;

export async function initializeServer() {
  if (isInitialized) {
    console.log("[ServerInit] Already initialized, skipping...");
    return;
  }

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
  }
}

// Auto-initialize on module load
initializeServer().catch((error) => {
  console.error("[ServerInit] Auto-initialization error:", error);
});
