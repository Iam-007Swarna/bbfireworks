export default function ProductLoading() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto animate-pulse">
      {/* Left: Image skeleton */}
      <div className="space-y-3">
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Right: Details skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        </div>

        <div className="card p-4 bg-gray-100 dark:bg-gray-800">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded" />

        <div className="card p-4 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>

        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}
