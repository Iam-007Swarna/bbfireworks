import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading BB Fireworks...</p>
      </div>
    </div>
  );
}
