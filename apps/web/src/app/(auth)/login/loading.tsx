'use client';

import { Skeleton } from '@/components/ui';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/header */}
        <div className="text-center mb-8">
          <Skeleton variant="circular" className="w-16 h-16 mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Login form card */}
        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Submit button */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <Skeleton className="h-4 w-8" />
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Social login */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Footer link */}
        <div className="text-center mt-4">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
