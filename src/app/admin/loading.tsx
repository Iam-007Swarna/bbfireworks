import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
      </div>
    </div>
  );
}
