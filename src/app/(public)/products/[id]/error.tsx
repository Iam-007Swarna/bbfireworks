'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Failed to load product
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We couldn&apos;t load this product. It may have been removed or there was an error.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            Try Again
          </button>
          <Link href="/" className="btn border-gray-300 dark:border-gray-600">
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
