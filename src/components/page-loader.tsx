'use client';

import { Loader } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold text-primary">Loading...</p>
      </div>
    </div>
  );
}
