'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from '@/lib/api';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
