"use client";

import { useRouter } from "next/navigation";
import { Search, X, Command } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Suggestion = {
  id: string;
  name: string;
  sku: string;
  images: { id: string }[];
};

type Props = {
  defaultValue?: string;
};

export function SearchBar({ defaultValue }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const urlTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-side cache to reduce DB calls
  const cacheRef = useRef<Map<string, { data: Suggestion[]; timestamp: number }>>(new Map());

  // Fetch suggestions as user types with caching
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    suggestionsTimeoutRef.current = setTimeout(async () => {
      // Check cache first
      const cached = cacheRef.current.get(normalizedQuery);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        // Use cached data
        setSuggestions(cached.data);
        setShowSuggestions(true);
        return;
      }

      // Fetch from API
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        // Store in cache
        cacheRef.current.set(normalizedQuery, { data, timestamp: now });

        // Clean old cache entries (keep max 50 entries)
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }

        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    }, 200); // 200ms debounce for suggestions

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [query]);

  // Debounced search - automatically update URL params
  // IMPORTANT: Don't push URL during hydration to avoid client/server mismatch
  useEffect(() => {
    if (!mounted) return; // Block during hydration

    if (urlTimeoutRef.current) {
      clearTimeout(urlTimeoutRef.current);
    }

    urlTimeoutRef.current = setTimeout(() => {
      // Read from window to avoid searchParams identity issues during hydration
      const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : ''
      );

      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }

      router.push(`/?${params.toString()}`);
    }, 500); // 500ms debounce for URL update

    return () => {
      if (urlTimeoutRef.current) {
        clearTimeout(urlTimeoutRef.current);
      }
    };
  }, [query, router, mounted]); // Added mounted dependency

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      router.push(`/products/${selected.id}`);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
            size={18}
          />
          <input
            ref={inputRef}
            name="q"
            type="text"
            className="input w-full pl-10 pr-20"
            placeholder="Search by name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            autoComplete="off"
            suppressHydrationWarning
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {mounted && query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Clear search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
            {mounted && (
              <kbd
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                suppressHydrationWarning
              >
                <Command size={10} />K
              </kbd>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
            >
              {suggestions.map((suggestion, index) => (
                <Link
                  key={suggestion.id}
                  href={`/products/${suggestion.id}`}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    index === selectedIndex ? "bg-gray-50 dark:bg-gray-700" : ""
                  }`}
                  onClick={() => setShowSuggestions(false)}
                >
                  {suggestion.images[0]?.id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/images/${suggestion.images[0].id}`}
                      alt={suggestion.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Search size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">SKU: {suggestion.sku}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {mounted && query && query.length >= 2 && (
        <p className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
          {suggestions.length > 0
            ? `Found ${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}`
            : "No suggestions found"}
        </p>
      )}
    </div>
  );
}
