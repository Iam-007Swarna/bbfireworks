"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type RefreshCacheButtonProps = {
  refreshAction: () => Promise<void>;
};

export function RefreshCacheButton({ refreshAction }: RefreshCacheButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Call the server action
      startTransition(async () => {
        await refreshAction();
        // Refresh the router to show updated data
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to refresh cache:", error);
      alert("Failed to refresh cache. Check console for details.");
      setIsRefreshing(false);
    }

    // Reset state after a delay to show the animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing || isPending}
      className="btn flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw size={16} className={isRefreshing || isPending ? "animate-spin" : ""} />
      {isRefreshing || isPending ? "Refreshing..." : "Refresh Cache"}
    </button>
  );
}
