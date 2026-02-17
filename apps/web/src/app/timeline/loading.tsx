'use client';

import { Skeleton } from '@/components/ui';

export default function TimelineLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </header>

      {/* View mode toggles skeleton */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Timeline content skeleton */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="space-y-8">
          {/* Year markers */}
          <div className="flex items-center gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 flex-shrink-0" />
            ))}
          </div>

          {/* Timeline events */}
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200" />
            <div className="flex gap-6 overflow-hidden py-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <div className="bg-white rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend skeleton */}
          <div className="flex items-center gap-4 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-4 h-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
