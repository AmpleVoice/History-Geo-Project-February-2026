'use client';

import { Skeleton, SkeletonTable } from '@/components/ui';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar skeleton */}
      <aside className="w-64 bg-white border-l h-screen sticky top-0">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-full" />
        </div>
        <nav className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton variant="circular" className="w-8 h-8" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <SkeletonTable rows={8} cols={5} />
        </div>
      </main>
    </div>
  );
}
