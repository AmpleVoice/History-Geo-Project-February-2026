import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard, EventCardData } from '@/features/events/EventCard';

const mockEvent: EventCardData = {
  id: 'evt-001',
  title: 'ثورة الأمير عبد القادر',
  type: 'ثورة',
  regionName: 'معسكر',
  startDate: '1832-11-22',
  endDate: '1847-12-23',
  description: 'مقاومة مسلحة شاملة قادها الأمير عبد القادر بن محيي الدين.',
  reviewStatus: 'مؤكد',
  leadersCount: 1,
};

describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('ثورة الأمير عبد القادر')).toBeInTheDocument();
  });

  it('renders event type badge', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('ثورة')).toBeInTheDocument();
  });

  it('renders event description', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/مقاومة مسلحة شاملة/)).toBeInTheDocument();
  });

  it('renders region name', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('معسكر')).toBeInTheDocument();
  });

  it('renders date range', () => {
    render(<EventCard event={mockEvent} />);
    // Should display formatted date range
    expect(screen.getByText(/1832/)).toBeInTheDocument();
  });

  it('renders leaders count when available', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/1 قائد/)).toBeInTheDocument();
  });

  it('does not render leaders count when zero', () => {
    const eventWithoutLeaders = { ...mockEvent, leadersCount: 0 };
    render(<EventCard event={eventWithoutLeaders} />);
    expect(screen.queryByText(/قائد/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected styles when isSelected is true', () => {
    render(<EventCard event={mockEvent} isSelected />);
    const card = screen.getByRole('button');
    expect(card).toHaveClass('ring-2', 'ring-primary-500');
  });

  it('does not show review status badge for confirmed events', () => {
    render(<EventCard event={mockEvent} />);
    // Should not show the status badge since it's "مؤكد"
    const badges = screen.getAllByText(/ثورة/);
    expect(badges).toHaveLength(1);
  });

  it('shows review status badge for unconfirmed events', () => {
    const unconfirmedEvent = { ...mockEvent, reviewStatus: 'بحاجة_لمراجعة' };
    render(<EventCard event={unconfirmedEvent} />);
    expect(screen.getByText('بحاجة لمراجعة')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has correct ARIA attributes', () => {
    render(<EventCard event={mockEvent} isSelected />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-selected', 'true');
  });

  it('hides description in compact mode', () => {
    render(<EventCard event={mockEvent} compact />);
    expect(screen.queryByText(/مقاومة مسلحة شاملة/)).not.toBeInTheDocument();
  });

  it('applies different type colors', () => {
    const battleEvent = { ...mockEvent, type: 'معركة' };
    render(<EventCard event={battleEvent} />);
    const badge = screen.getByText('معركة');
    expect(badge).toHaveClass('bg-orange-100');
  });

  it('handles events without end date', () => {
    const eventWithoutEndDate = { ...mockEvent, endDate: undefined };
    render(<EventCard event={eventWithoutEndDate} />);
    // Should still render without error
    expect(screen.getByText('ثورة الأمير عبد القادر')).toBeInTheDocument();
  });
});
