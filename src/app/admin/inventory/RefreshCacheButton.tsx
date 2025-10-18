"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RefreshCacheButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/inventory/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the page to show updated data
        router.refresh();
      } else {
        alert(`Failed to refresh cache: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to refresh cache:", error);
      alert("Failed to refresh cache. Check console for details.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="btn flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
      {isRefreshing ? "Refreshing..." : "Refresh Cache"}
    </button>
  );
}
