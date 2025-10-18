import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <FileQuestion className="w-24 h-24 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="btn bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            Go Home
          </Link>
          <Link href="/products" className="btn border-gray-300 dark:border-gray-600">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
