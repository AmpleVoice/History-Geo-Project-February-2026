'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAuthStore } from './store';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/admin' }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data.email, data.password);
    if (success) {
      router.push(redirectTo);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
        <p className="text-neutral-500 mt-2">
          الدخول إلى لوحة إدارة المحتوى
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2 text-accent-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                {...register('email')}
                className={cn(
                  'w-full ps-10 pe-4 py-2 border rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.email ? 'border-accent-500' : 'border-neutral-300'
                )}
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-accent-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                {...register('password')}
                className={cn(
                  'w-full ps-10 pe-4 py-2 border rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.password ? 'border-accent-500' : 'border-neutral-300'
                )}
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-accent-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'جاري الدخول...' : 'دخول'}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-500 text-center">
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
