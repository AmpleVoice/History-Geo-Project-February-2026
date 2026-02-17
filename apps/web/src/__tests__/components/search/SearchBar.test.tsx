import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar, highlightMatch } from '@/components/search/SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with placeholder text', () => {
    render(<SearchBar onChange={mockOnChange} />);
    expect(screen.getByPlaceholderText(/ابحث عن ثورة/)).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar onChange={mockOnChange} placeholder="بحث مخصص" />);
    expect(screen.getByPlaceholderText('بحث مخصص')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    expect(screen.getByRole('searchbox')).toHaveValue('test');
  });

  it('debounces onChange calls', async () => {
    render(<SearchBar onChange={mockOnChange} debounceMs={300} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'ثورة' } });

    // Should not call immediately
    expect(mockOnChange).not.toHaveBeenCalled();

    // Fast forward debounce time
    jest.advanceTimersByTime(300);

    expect(mockOnChange).toHaveBeenCalledWith('ثورة');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('shows clear button when value exists', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    expect(screen.getByRole('button', { name: /مسح البحث/i })).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    expect(screen.queryByRole('button', { name: /مسح البحث/i })).not.toBeInTheDocument();
  });

  it('clears value when clear button is clicked', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByRole('button', { name: /مسح البحث/i });

    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('clears value on Escape key press', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<SearchBar onChange={mockOnChange} isLoading />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has correct RTL direction', () => {
    render(<SearchBar onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('dir', 'rtl');
  });

  it('has correct ARIA attributes', () => {
    render(<SearchBar onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'بحث');
  });

  it('calls onFocus when focused', () => {
    const handleFocus = jest.fn();
    render(<SearchBar onChange={mockOnChange} onFocus={handleFocus} />);
    const input = screen.getByRole('searchbox');

    fireEvent.focus(input);

    expect(handleFocus).toHaveBeenCalled();
  });

  it('calls onBlur when blurred', () => {
    const handleBlur = jest.fn();
    render(<SearchBar onChange={mockOnChange} onBlur={handleBlur} />);
    const input = screen.getByRole('searchbox');

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalled();
  });
});

describe('highlightMatch', () => {
  it('returns original text when query is empty', () => {
    const result = highlightMatch('test text', '');
    expect(result).toBe('test text');
  });

  it('returns original text when query is whitespace', () => {
    const result = highlightMatch('test text', '   ');
    expect(result).toBe('test text');
  });

  it('highlights matching text', () => {
    const { container } = render(<>{highlightMatch('ثورة المقراني', 'ثورة')}</>);
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('ثورة');
  });

  it('is case insensitive', () => {
    const { container } = render(<>{highlightMatch('Test Text', 'test')}</>);
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('Test');
  });

  it('handles multiple matches', () => {
    const { container } = render(<>{highlightMatch('test test test', 'test')}</>);
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(3);
  });

  it('handles Arabic text correctly', () => {
    const { container } = render(<>{highlightMatch('ثورة الأمير عبد القادر', 'الأمير')}</>);
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('الأمير');
  });
});
