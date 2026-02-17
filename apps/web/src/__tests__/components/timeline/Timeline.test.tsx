import { render, screen, fireEvent } from '@testing-library/react';
import { VerticalTimeline } from '@/components/timeline/VerticalTimeline';
import { EventCardData } from '@/features/events/EventCard';

const mockEvents: EventCardData[] = [
  {
    id: 'evt-001',
    title: 'ثورة الأمير عبد القادر',
    type: 'ثورة',
    regionName: 'معسكر',
    startDate: '1832-11-22',
    endDate: '1847-12-23',
    description: 'مقاومة مسلحة شاملة.',
    reviewStatus: 'مؤكد',
    leadersCount: 1,
  },
  {
    id: 'evt-002',
    title: 'ثورة المقراني',
    type: 'ثورة',
    regionName: 'برج بوعريريج',
    startDate: '1871-03-16',
    endDate: '1872-01-20',
    description: 'انتفاضة كبرى.',
    reviewStatus: 'مؤكد',
    leadersCount: 2,
  },
  {
    id: 'evt-003',
    title: 'انتفاضة سطيف 1945',
    type: 'انتفاضة',
    regionName: 'سطيف',
    startDate: '1945-05-08',
    endDate: '1945-06-01',
    description: 'انتفاضة شعبية.',
    reviewStatus: 'مؤكد',
    leadersCount: 0,
  },
];

describe('VerticalTimeline', () => {
  it('renders all events', () => {
    render(<VerticalTimeline events={mockEvents} />);

    expect(screen.getByText('ثورة الأمير عبد القادر')).toBeInTheDocument();
    expect(screen.getByText('ثورة المقراني')).toBeInTheDocument();
    expect(screen.getByText('انتفاضة سطيف 1945')).toBeInTheDocument();
  });

  it('sorts events chronologically', () => {
    render(<VerticalTimeline events={mockEvents} />);

    const titles = screen.getAllByRole('button').map((btn) =>
      btn.querySelector('h4')?.textContent
    );

    expect(titles[0]).toBe('ثورة الأمير عبد القادر');
    expect(titles[1]).toBe('ثورة المقراني');
    expect(titles[2]).toBe('انتفاضة سطيف 1945');
  });

  it('calls onEventSelect when event is clicked', () => {
    const handleSelect = jest.fn();
    render(<VerticalTimeline events={mockEvents} onEventSelect={handleSelect} />);

    fireEvent.click(screen.getByText('ثورة الأمير عبد القادر').closest('button')!);

    expect(handleSelect).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('highlights selected event', () => {
    render(
      <VerticalTimeline
        events={mockEvents}
        selectedEventId="evt-001"
      />
    );

    const selectedButton = screen.getByText('ثورة الأمير عبد القادر').closest('button');
    expect(selectedButton).toHaveClass('bg-primary-50');
  });

  it('respects maxVisible prop', () => {
    render(<VerticalTimeline events={mockEvents} maxVisible={2} />);

    expect(screen.getByText('ثورة الأمير عبد القادر')).toBeInTheDocument();
    expect(screen.getByText('ثورة المقراني')).toBeInTheDocument();
    expect(screen.queryByText('انتفاضة سطيف 1945')).not.toBeInTheDocument();
  });

  it('shows remaining count badge when maxVisible is exceeded', () => {
    render(<VerticalTimeline events={mockEvents} maxVisible={2} />);

    expect(screen.getByText('+1 أحداث أخرى')).toBeInTheDocument();
  });

  it('renders event type badges', () => {
    render(<VerticalTimeline events={mockEvents} />);

    const revolutionBadges = screen.getAllByText('ثورة');
    expect(revolutionBadges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('انتفاضة')).toBeInTheDocument();
  });

  it('renders event dates', () => {
    render(<VerticalTimeline events={mockEvents} />);

    expect(screen.getByText(/1832/)).toBeInTheDocument();
    expect(screen.getByText(/1871/)).toBeInTheDocument();
    expect(screen.getByText(/1945/)).toBeInTheDocument();
  });

  it('renders region names', () => {
    render(<VerticalTimeline events={mockEvents} />);

    expect(screen.getByText('معسكر')).toBeInTheDocument();
    expect(screen.getByText('برج بوعريريج')).toBeInTheDocument();
    expect(screen.getByText('سطيف')).toBeInTheDocument();
  });

  describe('groupBy prop', () => {
    it('groups by year by default', () => {
      render(<VerticalTimeline events={mockEvents} groupBy="year" />);

      // Events should be displayed individually
      expect(screen.getByText('ثورة الأمير عبد القادر')).toBeInTheDocument();
    });

    it('groups by period when groupBy="period"', () => {
      render(<VerticalTimeline events={mockEvents} groupBy="period" />);

      // Should show period headers
      expect(screen.getByText(/عهد الأمير عبد القادر/)).toBeInTheDocument();
    });

    it('shows event count badges in period view', () => {
      render(<VerticalTimeline events={mockEvents} groupBy="period" />);

      // Should show count badges for each period
      const badges = screen.getAllByText(/حدث/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('renders empty state when no events', () => {
    render(<VerticalTimeline events={[]} />);

    // Should render without errors but show no events
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays event description', () => {
    render(<VerticalTimeline events={mockEvents} />);

    expect(screen.getByText('مقاومة مسلحة شاملة.')).toBeInTheDocument();
  });

  it('applies compact styles when compact mode is used', () => {
    render(<VerticalTimeline events={mockEvents} groupBy="period" />);

    // In period view, events use compact styling
    const compactMarkers = document.querySelectorAll('.w-3.h-3');
    expect(compactMarkers.length).toBeGreaterThan(0);
  });
});
