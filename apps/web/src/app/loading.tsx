'use client';

import { Skeleton } from '@/components/ui';

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <header className="h-16 border-b bg-white px-4 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar skeleton */}
        <aside className="w-80 border-l bg-white p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </aside>

        {/* Map skeleton */}
        <main className="flex-1 bg-neutral-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton variant="circular" className="w-16 h-16 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </main>
      </div>
    </div>
  );
}
