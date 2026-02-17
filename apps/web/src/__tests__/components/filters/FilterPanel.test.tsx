import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterPanel, FilterValues } from '@/components/filters/FilterPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useRegions hook
jest.mock('@/lib/api/hooks', () => ({
  useRegions: () => ({
    data: [
      { code: '29', nameAr: 'معسكر' },
      { code: '15', nameAr: 'تيزي وزو' },
      { code: '25', nameAr: 'قسنطينة' },
    ],
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('FilterPanel', () => {
  const mockOnChange = jest.fn();
  const defaultValues: FilterValues = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inline variant correctly', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('نوع الحدث')).toBeInTheDocument();
    expect(screen.getByText('المنطقة')).toBeInTheDocument();
    expect(screen.getByText('الفترة الزمنية')).toBeInTheDocument();
  });

  it('renders dropdown variant with toggle button', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="dropdown" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /تصفية/i })).toBeInTheDocument();
  });

  it('opens dropdown panel when toggle is clicked', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="dropdown" />,
      { wrapper: createWrapper() }
    );

    const toggleButton = screen.getByRole('button', { name: /تصفية/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('تصفية الأحداث')).toBeInTheDocument();
  });

  it('calls onChange when type filter is changed', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(typeSelect, { target: { value: 'REVOLUTION' } });

    expect(mockOnChange).toHaveBeenCalledWith({ type: 'REVOLUTION' });
  });

  it('calls onChange when region filter is changed', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const regionSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(regionSelect, { target: { value: '29' } });

    expect(mockOnChange).toHaveBeenCalledWith({ regionCode: '29' });
  });

  it('calls onChange when start year is changed', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const yearInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(yearInputs[0], { target: { value: '1850' } });

    expect(mockOnChange).toHaveBeenCalledWith({ startYear: 1850 });
  });

  it('calls onChange when end year is changed', () => {
    render(
      <FilterPanel values={defaultValues} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const yearInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(yearInputs[1], { target: { value: '1900' } });

    expect(mockOnChange).toHaveBeenCalledWith({ endYear: 1900 });
  });

  it('shows reset button when filters are active', () => {
    const activeFilters: FilterValues = { type: 'REVOLUTION' };

    render(
      <FilterPanel values={activeFilters} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /إعادة تعيين/i })).toBeInTheDocument();
  });

  it('resets all filters when reset button is clicked', () => {
    const activeFilters: FilterValues = {
      type: 'REVOLUTION',
      regionCode: '29',
      startYear: 1850,
    };

    render(
      <FilterPanel values={activeFilters} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const resetButton = screen.getByRole('button', { name: /إعادة تعيين/i });
    fireEvent.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith({});
  });

  it('highlights active type filter', () => {
    const activeFilters: FilterValues = { type: 'REVOLUTION' };

    render(
      <FilterPanel values={activeFilters} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const typeSelect = screen.getAllByRole('combobox')[0];
    expect(typeSelect).toHaveClass('border-primary-300');
  });

  it('shows active filter count in dropdown variant', () => {
    const activeFilters: FilterValues = {
      type: 'REVOLUTION',
      regionCode: '29',
    };

    render(
      <FilterPanel values={activeFilters} onChange={mockOnChange} variant="dropdown" />,
      { wrapper: createWrapper() }
    );

    // Should show badge with count
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('clears type filter when selecting empty option', () => {
    const activeFilters: FilterValues = { type: 'REVOLUTION' };

    render(
      <FilterPanel values={activeFilters} onChange={mockOnChange} variant="inline" />,
      { wrapper: createWrapper() }
    );

    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(typeSelect, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith({});
  });
});
