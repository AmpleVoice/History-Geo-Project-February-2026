import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useEvents,
  useEvent,
  useSearchEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useRegions,
  useSources,
} from '@/lib/api/hooks';
import { api } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  api: {
    events: {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      statistics: jest.fn(),
    },
    regions: {
      list: jest.fn(),
      get: jest.fn(),
      getByCode: jest.fn(),
      geojson: jest.fn(),
    },
    sources: {
      list: jest.fn(),
      get: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockEventsResponse = {
  data: [
    {
      id: 'evt-001',
      title: 'ثورة الأمير عبد القادر',
      type: 'REVOLUTION',
      startDate: '1832-11-22',
    },
    {
      id: 'evt-002',
      title: 'ثورة المقراني',
      type: 'REVOLUTION',
      startDate: '1871-03-16',
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const mockEvent = {
  id: 'evt-001',
  title: 'ثورة الأمير عبد القادر',
  type: 'REVOLUTION',
  description: 'مقاومة مسلحة شاملة.',
  startDate: '1832-11-22',
  endDate: '1847-12-23',
  region: { id: 'reg-29', nameAr: 'معسكر', code: '29' },
};

const mockRegions = [
  { id: 'reg-29', code: '29', nameAr: 'معسكر' },
  { id: 'reg-15', code: '15', nameAr: 'تيزي وزو' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.events.list as jest.Mock).mockResolvedValue(mockEventsResponse);
  });

  it('fetches events successfully', async () => {
    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEventsResponse);
    expect(api.events.list).toHaveBeenCalledTimes(1);
  });

  it('passes query parameters to API', async () => {
    const params = { search: 'ثورة', type: 'REVOLUTION', page: 2 };
    const { result } = renderHook(() => useEvents(params), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.events.list).toHaveBeenCalledWith(params);
  });

  it('handles API errors', async () => {
    (api.events.list as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useEvents(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe('useEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.events.get as jest.Mock).mockResolvedValue(mockEvent);
  });

  it('fetches single event by ID', async () => {
    const { result } = renderHook(() => useEvent('evt-001'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEvent);
    expect(api.events.get).toHaveBeenCalledWith('evt-001');
  });

  it('does not fetch when ID is empty', () => {
    renderHook(() => useEvent(''), { wrapper: createWrapper() });

    expect(api.events.get).not.toHaveBeenCalled();
  });
});

describe('useSearchEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.events.list as jest.Mock).mockResolvedValue(mockEventsResponse);
  });

  it('searches events when query length >= 2', async () => {
    const { result } = renderHook(() => useSearchEvents('ثو'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.events.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'ثو' }));
  });

  it('does not search when query is too short', () => {
    renderHook(() => useSearchEvents('ث'), { wrapper: createWrapper() });

    expect(api.events.list).not.toHaveBeenCalled();
  });

  it('passes filters along with search query', async () => {
    const filters = { type: 'REVOLUTION', startYear: 1830 };
    const { result } = renderHook(() => useSearchEvents('ثورة', filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'ثورة',
        type: 'REVOLUTION',
        startYear: 1830,
      })
    );
  });
});

describe('useCreateEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.events.create as jest.Mock).mockResolvedValue(mockEvent);
  });

  it('creates event and returns data', async () => {
    const { result } = renderHook(() => useCreateEvent(), { wrapper: createWrapper() });

    const newEvent = { title: 'Test Event', type: 'REVOLUTION', startDate: '1840-01-01' };
    await result.current.mutateAsync(newEvent);

    expect(api.events.create).toHaveBeenCalledWith(newEvent);
  });
});

describe('useUpdateEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.events.update as jest.Mock).mockResolvedValue({ ...mockEvent, title: 'Updated Title' });
  });

  it('updates event with ID and data', async () => {
    const { result } = renderHook(() => useUpdateEvent(), { wrapper: createWrapper() });

    const updateData = { title: 'Updated Title' };
    await result.current.mutateAsync({ id: 'evt-001', data: updateData });

    expect(api.events.update).toHaveBeenCalledWith('evt-001', updateData);
  });
});

describe('useDeleteEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.events.delete as jest.Mock).mockResolvedValue({ success: true });
  });

  it('deletes event by ID', async () => {
    const { result } = renderHook(() => useDeleteEvent(), { wrapper: createWrapper() });

    await result.current.mutateAsync('evt-001');

    expect(api.events.delete).toHaveBeenCalledWith('evt-001');
  });
});

describe('useRegions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.regions.list as jest.Mock).mockResolvedValue(mockRegions);
  });

  it('fetches regions list', async () => {
    const { result } = renderHook(() => useRegions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRegions);
    expect(api.regions.list).toHaveBeenCalledTimes(1);
  });
});

describe('useSources', () => {
  const mockSources = [
    { id: 'src-001', title: 'تاريخ الجزائر', author: 'سعد الله' },
    { id: 'src-002', title: 'الأمير عبد القادر', author: 'الجيلالي' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.sources.list as jest.Mock).mockResolvedValue(mockSources);
  });

  it('fetches sources list', async () => {
    const { result } = renderHook(() => useSources(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSources);
    expect(api.sources.list).toHaveBeenCalledTimes(1);
  });
});
