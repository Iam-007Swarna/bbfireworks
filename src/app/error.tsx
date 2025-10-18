'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="w-20 h-20 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          We encountered an unexpected error. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            Try Again
          </button>
          <Link href="/" className="btn border-gray-300 dark:border-gray-600">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
