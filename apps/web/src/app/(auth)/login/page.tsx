'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, useAuthStore } from '@/features/auth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">خ</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">
            خريطة المقاومات الشعبية
          </h1>
          <p className="text-neutral-500 mt-1">لوحة الإدارة</p>
        </div>

        <LoginForm />

        {/* Back link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-primary-600 hover:underline"
          >
            ← العودة للخريطة
          </a>
        </div>
      </div>
    </div>
  );
}
