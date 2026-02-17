'use client';

import { useState } from 'react';
import { Book, FileText, Newspaper, Globe, Video, Archive, ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Source types with icons
const SOURCE_TYPE_CONFIG: Record<string, { icon: typeof Book; label: string; color: string }> = {
  BOOK: { icon: Book, label: 'كتاب', color: 'bg-blue-100 text-blue-700' },
  JOURNAL: { icon: FileText, label: 'مجلة علمية', color: 'bg-purple-100 text-purple-700' },
  NEWSPAPER: { icon: Newspaper, label: 'صحيفة', color: 'bg-yellow-100 text-yellow-700' },
  WEBSITE: { icon: Globe, label: 'موقع إلكتروني', color: 'bg-green-100 text-green-700' },
  VIDEO: { icon: Video, label: 'فيديو', color: 'bg-red-100 text-red-700' },
  ARCHIVE: { icon: Archive, label: 'أرشيف', color: 'bg-orange-100 text-orange-700' },
  OTHER: { icon: FileText, label: 'أخرى', color: 'bg-neutral-100 text-neutral-700' },
};

export interface SourceData {
  id: string;
  title: string;
  author?: string;
  year?: number;
  publisher?: string;
  type: string;
  url?: string;
  pageRange?: string;
  volume?: string;
  issue?: string;
  accessDate?: string;
  language?: string;
}

interface CitationProps {
  source: SourceData;
  pageRange?: string;
  variant?: 'inline' | 'full' | 'compact';
  showCopyButton?: boolean;
  className?: string;
}

export function Citation({
  source,
  pageRange,
  variant = 'full',
  showCopyButton = true,
  className,
}: CitationProps) {
  const [copied, setCopied] = useState(false);
  const config = SOURCE_TYPE_CONFIG[source.type] || SOURCE_TYPE_CONFIG.OTHER;
  const Icon = config.icon;

  // Generate formatted citation text
  const getCitationText = () => {
    let citation = '';

    // Author
    if (source.author) {
      citation += source.author;
    }

    // Year
    if (source.year) {
      citation += ` (${source.year})`;
    }

    // Title
    citation += citation ? `. ${source.title}` : source.title;

    // Volume/Issue for journals
    if (source.volume) {
      citation += `، المجلد ${source.volume}`;
      if (source.issue) {
        citation += `، العدد ${source.issue}`;
      }
    }

    // Publisher
    if (source.publisher) {
      citation += `، ${source.publisher}`;
    }

    // Page range
    const pages = pageRange || source.pageRange;
    if (pages) {
      citation += `، ${pages}`;
    }

    // URL for websites
    if (source.url) {
      citation += `، متاح على: ${source.url}`;
      if (source.accessDate) {
        citation += ` (تم الاطلاع: ${source.accessDate})`;
      }
    }

    return citation;
  };

  const handleCopy = async () => {
    const text = getCitationText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline variant - just the essential info
  if (variant === 'inline') {
    return (
      <span className={cn('text-neutral-600', className)}>
        {source.author && `${source.author}، `}
        <em>{source.title}</em>
        {source.year && ` (${source.year})`}
        {pageRange && `، ${pageRange}`}
      </span>
    );
  }

  // Compact variant - single line with icon
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-neutral-600',
          className
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">
          {source.author && `${source.author}: `}
          {source.title}
          {source.year && ` (${source.year})`}
        </span>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 flex-shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  // Full variant - complete card
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-lg p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', config.color.split(' ')[0])}>
            <Icon className={cn('h-4 w-4', config.color.split(' ')[1])} />
          </div>
          <Badge variant="outline" className="text-xs">
            {config.label}
          </Badge>
        </div>

        {showCopyButton && (
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-colors',
              copied
                ? 'bg-green-100 text-green-600'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
            title="نسخ الاقتباس"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Citation content */}
      <div className="space-y-2">
        {/* Title */}
        <h4 className="font-medium text-neutral-900">{source.title}</h4>

        {/* Author and year */}
        {(source.author || source.year) && (
          <p className="text-sm text-neutral-600">
            {source.author}
            {source.author && source.year && ' • '}
            {source.year && `${source.year}م`}
          </p>
        )}

        {/* Publisher */}
        {source.publisher && (
          <p className="text-sm text-neutral-500">
            الناشر: {source.publisher}
          </p>
        )}

        {/* Volume/Issue */}
        {source.volume && (
          <p className="text-sm text-neutral-500">
            المجلد {source.volume}
            {source.issue && `، العدد ${source.issue}`}
          </p>
        )}

        {/* Page range */}
        {(pageRange || source.pageRange) && (
          <p className="text-sm text-neutral-500">
            الصفحات: {pageRange || source.pageRange}
          </p>
        )}

        {/* URL */}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            رابط المصدر
          </a>
        )}
      </div>
    </div>
  );
}

// Component for displaying a list of citations
interface CitationListProps {
  sources: Array<{
    source: SourceData;
    pageRange?: string;
  }>;
  title?: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function CitationList({
  sources,
  title = 'المصادر والمراجع',
  className,
  collapsible = false,
  defaultExpanded = true,
}: CitationListProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <button
        onClick={() => collapsible && setExpanded(!expanded)}
        className={cn(
          'flex items-center justify-between w-full mb-3',
          collapsible && 'cursor-pointer hover:text-primary-600'
        )}
        disabled={!collapsible}
      >
        <h3 className="font-heading font-bold text-neutral-800 flex items-center gap-2">
          <Book className="h-5 w-5" />
          {title}
          <Badge variant="outline" className="text-xs font-normal">
            {sources.length}
          </Badge>
        </h3>
        {collapsible && (
          expanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )
        )}
      </button>

      {/* Sources list */}
      {expanded && (
        <div className="space-y-3">
          {sources.map((item, index) => (
            <Citation
              key={item.source.id}
              source={item.source}
              pageRange={item.pageRange}
              variant="full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Footnote-style citation for inline use
interface FootnoteCitationProps {
  number: number;
  source: SourceData;
  pageRange?: string;
}

export function FootnoteCitation({ number, source, pageRange }: FootnoteCitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <sup
        className="cursor-help text-primary-600 hover:text-primary-700 font-medium"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        [{number}]
      </sup>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 animate-fade-in">
          <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3 text-sm">
            <Citation source={source} pageRange={pageRange} variant="compact" />
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
        </div>
      )}
    </span>
  );
}
