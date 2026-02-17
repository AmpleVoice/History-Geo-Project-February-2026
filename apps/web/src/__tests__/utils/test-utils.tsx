import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface ProvidersProps {
  children: React.ReactNode;
}

// All providers wrapper
function AllProviders({ children }: ProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

// Mock event data for tests
export const mockEvent = {
  id: 'evt-001',
  title: 'ثورة الأمير عبد القادر',
  type: 'ثورة',
  regionId: 'reg-29',
  regionName: 'معسكر',
  startDate: '1832-11-22',
  endDate: '1847-12-23',
  description: 'مقاومة مسلحة شاملة قادها الأمير عبد القادر بن محيي الدين.',
  reviewStatus: 'مؤكد',
  leadersCount: 1,
  region: {
    id: 'reg-29',
    nameAr: 'معسكر',
    code: '29',
  },
  people: [
    {
      person: {
        id: 'per-001',
        nameAr: 'الأمير عبد القادر',
        role: 'قائد',
      },
    },
  ],
  sources: [],
};

export const mockEvents = [
  mockEvent,
  {
    id: 'evt-002',
    title: 'ثورة المقراني',
    type: 'ثورة',
    regionId: 'reg-34',
    regionName: 'برج بوعريريج',
    startDate: '1871-03-16',
    endDate: '1872-01-20',
    description: 'انتفاضة كبرى قادها محمد المقراني.',
    reviewStatus: 'مؤكد',
    leadersCount: 2,
    region: {
      id: 'reg-34',
      nameAr: 'برج بوعريريج',
      code: '34',
    },
    people: [],
    sources: [],
  },
  {
    id: 'evt-003',
    title: 'مقاومة لالة فاطمة نسومر',
    type: 'مقاومة',
    regionId: 'reg-15',
    regionName: 'تيزي وزو',
    startDate: '1854-01-01',
    endDate: '1857-07-11',
    description: 'مقاومة منطقة القبائل بقيادة لالة فاطمة نسومر.',
    reviewStatus: 'مؤكد',
    leadersCount: 1,
    region: {
      id: 'reg-15',
      nameAr: 'تيزي وزو',
      code: '15',
    },
    people: [],
    sources: [],
  },
];

export const mockRegions = [
  { id: 'reg-29', code: '29', nameAr: 'معسكر' },
  { id: 'reg-34', code: '34', nameAr: 'برج بوعريريج' },
  { id: 'reg-15', code: '15', nameAr: 'تيزي وزو' },
  { id: 'reg-25', code: '25', nameAr: 'قسنطينة' },
];

export const mockSource = {
  id: 'src-001',
  title: 'تاريخ الجزائر الثقافي',
  author: 'أبو القاسم سعد الله',
  year: 1998,
  publisher: 'دار الغرب الإسلامي',
  type: 'BOOK',
};

// Wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Create mock API responses
export const createMockApiResponse = <T,>(data: T, total = 1) => ({
  data,
  total,
  page: 1,
  limit: 20,
  totalPages: Math.ceil(total / 20),
});
