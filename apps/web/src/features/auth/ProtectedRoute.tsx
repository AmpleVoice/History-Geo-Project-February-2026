'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type User } from './store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'VIEWER' | 'EDITOR' | 'ADMIN';
  fallback?: React.ReactNode;
}

/**
 * Component that protects routes based on authentication and role
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return fallback || <LoadingFallback />;
  }

  // Check role if required
  if (requiredRole) {
    const hasPermission = checkRolePermission(user.role, requiredRole);
    if (!hasPermission) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
}

/**
 * Check if user role has permission for required role
 */
function checkRolePermission(
  userRole: User['role'],
  requiredRole: User['role']
): boolean {
  const roleHierarchy: Record<User['role'], number> = {
    VIEWER: 1,
    EDITOR: 2,
    ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">جاري التحميل...</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          غير مصرح
        </h1>
        <p className="text-neutral-600 mb-6">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:underline"
        >
          العودة للصفحة السابقة
        </button>
      </div>
    </div>
  );
}
