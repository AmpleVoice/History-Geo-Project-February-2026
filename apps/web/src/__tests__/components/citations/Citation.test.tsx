import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Citation, CitationList, SourceData } from '@/components/citations/Citation';

const mockSource: SourceData = {
  id: 'src-001',
  title: 'تاريخ الجزائر الثقافي',
  author: 'أبو القاسم سعد الله',
  year: 1998,
  publisher: 'دار الغرب الإسلامي',
  type: 'BOOK',
  pageRange: 'ج3، ص 245-320',
};

const mockJournalSource: SourceData = {
  id: 'src-002',
  title: 'دراسات تاريخية',
  author: 'محمد أحمد',
  year: 2020,
  type: 'JOURNAL',
  volume: '15',
  issue: '3',
};

const mockWebSource: SourceData = {
  id: 'src-003',
  title: 'موسوعة الجزائر',
  type: 'WEBSITE',
  url: 'https://example.com/article',
  accessDate: '2026-01-15',
};

describe('Citation', () => {
  describe('full variant', () => {
    it('renders source title', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByText('تاريخ الجزائر الثقافي')).toBeInTheDocument();
    });

    it('renders author and year', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByText(/أبو القاسم سعد الله/)).toBeInTheDocument();
      expect(screen.getByText(/1998/)).toBeInTheDocument();
    });

    it('renders publisher', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByText(/دار الغرب الإسلامي/)).toBeInTheDocument();
    });

    it('renders page range', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByText(/ج3، ص 245-320/)).toBeInTheDocument();
    });

    it('renders source type badge', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByText('كتاب')).toBeInTheDocument();
    });

    it('shows copy button by default', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByTitle('نسخ الاقتباس')).toBeInTheDocument();
    });

    it('hides copy button when showCopyButton is false', () => {
      render(<Citation source={mockSource} showCopyButton={false} />);
      expect(screen.queryByTitle('نسخ الاقتباس')).not.toBeInTheDocument();
    });

    it('copies citation to clipboard when copy button is clicked', async () => {
      render(<Citation source={mockSource} />);
      const copyButton = screen.getByTitle('نسخ الاقتباس');

      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('compact variant', () => {
    it('renders in single line', () => {
      render(<Citation source={mockSource} variant="compact" />);
      expect(screen.getByText(/أبو القاسم سعد الله/)).toBeInTheDocument();
      expect(screen.getByText(/تاريخ الجزائر الثقافي/)).toBeInTheDocument();
    });

    it('shows external link for URL sources', () => {
      render(<Citation source={mockWebSource} variant="compact" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/article');
    });
  });

  describe('inline variant', () => {
    it('renders as inline text', () => {
      const { container } = render(<Citation source={mockSource} variant="inline" />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('renders title in italics', () => {
      const { container } = render(<Citation source={mockSource} variant="inline" />);
      expect(container.querySelector('em')).toHaveTextContent('تاريخ الجزائر الثقافي');
    });
  });

  describe('source types', () => {
    it('shows book icon for book type', () => {
      render(<Citation source={mockSource} />);
      expect(screen.getByText('كتاب')).toBeInTheDocument();
    });

    it('shows journal icon for journal type', () => {
      render(<Citation source={mockJournalSource} />);
      expect(screen.getByText('مجلة علمية')).toBeInTheDocument();
    });

    it('renders volume and issue for journals', () => {
      render(<Citation source={mockJournalSource} />);
      expect(screen.getByText(/المجلد 15/)).toBeInTheDocument();
      expect(screen.getByText(/العدد 3/)).toBeInTheDocument();
    });

    it('shows website icon for website type', () => {
      render(<Citation source={mockWebSource} />);
      expect(screen.getByText('موقع إلكتروني')).toBeInTheDocument();
    });

    it('renders URL link for websites', () => {
      render(<Citation source={mockWebSource} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/article');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('with custom page range', () => {
    it('uses provided pageRange over source pageRange', () => {
      render(<Citation source={mockSource} pageRange="ص 100-150" />);
      expect(screen.getByText(/ص 100-150/)).toBeInTheDocument();
    });
  });
});

describe('CitationList', () => {
  const mockSources = [
    { source: mockSource, pageRange: 'ص 50-60' },
    { source: mockJournalSource },
  ];

  it('renders all sources', () => {
    render(<CitationList sources={mockSources} />);
    expect(screen.getByText('تاريخ الجزائر الثقافي')).toBeInTheDocument();
    expect(screen.getByText('دراسات تاريخية')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<CitationList sources={mockSources} title="المراجع" />);
    expect(screen.getByText('المراجع')).toBeInTheDocument();
  });

  it('renders count badge', () => {
    render(<CitationList sources={mockSources} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('returns null when sources is empty', () => {
    const { container } = render(<CitationList sources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is collapsible when collapsible prop is true', () => {
    render(<CitationList sources={mockSources} collapsible defaultExpanded={false} />);
    // Sources should be hidden initially
    expect(screen.queryByText('تاريخ الجزائر الثقافي')).not.toBeInTheDocument();
  });

  it('toggles visibility when header is clicked in collapsible mode', () => {
    render(<CitationList sources={mockSources} collapsible defaultExpanded={false} />);

    const header = screen.getByRole('button');
    fireEvent.click(header);

    expect(screen.getByText('تاريخ الجزائر الثقافي')).toBeInTheDocument();
  });

  it('is expanded by default', () => {
    render(<CitationList sources={mockSources} />);
    expect(screen.getByText('تاريخ الجزائر الثقافي')).toBeInTheDocument();
  });
});
