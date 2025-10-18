"use client";

import { useEffect, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";

type CacheRefreshTimerProps = {
  lastRefresh: Date | null;
  cacheTTL?: number; // in milliseconds, defaults to 24 hours
  showIcon?: boolean;
  compact?: boolean;
};

export function CacheRefreshTimer({
  lastRefresh,
  cacheTTL = 24 * 60 * 60 * 1000, // 24 hours default
  showIcon = true,
  compact = false,
}: CacheRefreshTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!lastRefresh) {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const now = new Date();
      const refreshTime = new Date(lastRefresh).getTime();
      const nextRefresh = refreshTime + cacheTTL;
      const diff = nextRefresh - now.getTime();

      if (diff <= 0) {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh, cacheTTL]);

  if (!timeRemaining) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
        {showIcon && <Clock size={12} />}
        <span className="font-mono">
          {timeRemaining.isExpired ? (
            <span className="text-red-600 dark:text-red-400">Expired</span>
          ) : (
            `${String(timeRemaining.hours).padStart(2, "0")}:${String(
              timeRemaining.minutes
            ).padStart(2, "0")}:${String(timeRemaining.seconds).padStart(2, "0")}`
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
        timeRemaining.isExpired
          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
      }`}
    >
      {showIcon && (
        <div>
          {timeRemaining.isExpired ? (
            <RefreshCw
              size={16}
              className="text-red-600 dark:text-red-400 animate-pulse"
            />
          ) : (
            <Clock size={16} className="text-gray-600 dark:text-gray-400" />
          )}
        </div>
      )}
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {timeRemaining.isExpired ? "Cache Expired" : "Next Refresh"}
        </div>
        <div
          className={`font-mono font-semibold text-sm ${
            timeRemaining.isExpired
              ? "text-red-600 dark:text-red-400"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {timeRemaining.isExpired ? (
            "00:00:00"
          ) : (
            <>
              {String(timeRemaining.hours).padStart(2, "0")}:
              {String(timeRemaining.minutes).padStart(2, "0")}:
              {String(timeRemaining.seconds).padStart(2, "0")}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
