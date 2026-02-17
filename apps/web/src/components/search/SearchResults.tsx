'use client';

import { Fragment } from 'react';
import { MapPin, Calendar, Users, FileText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { highlightMatch } from './SearchBar';
import type { Event, Person, Source } from '@algerian-history/shared';

interface SearchResultsProps {
  query: string;
  events: Event[];
  isLoading: boolean;
  onEventSelect: (event: Event) => void;
  onClose: () => void;
  className?: string;
}

export function SearchResults({
  query,
  events,
  isLoading,
  onEventSelect,
  onClose,
  className,
}: SearchResultsProps) {
  if (!query.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute top-full mt-2 inset-x-0 z-50',
        'bg-white rounded-xl border border-neutral-200 shadow-lg',
        'max-h-[70vh] overflow-hidden flex flex-col',
        className
      )}
      role="listbox"
      aria-label="نتائج البحث"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
        <h3 className="font-medium text-neutral-700">
          {isLoading ? (
            'جاري البحث...'
          ) : (
            <>
              {events.length > 0 ? (
                <>
                  <span className="text-primary-600 font-bold">{events.length}</span>
                  {' '}نتيجة لـ &quot;{query}&quot;
                </>
              ) : (
                <>لا توجد نتائج لـ &quot;{query}&quot;</>
              )}
            </>
          )}
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          إغلاق
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-neutral-500">جاري البحث في الأحداث...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="text-neutral-600 font-medium mb-1">لا توجد نتائج</p>
          <p className="text-sm text-neutral-500">
            جرب البحث بكلمات مختلفة أو أقصر
          </p>
        </div>
      )}

      {/* Results list */}
      {!isLoading && events.length > 0 && (
        <div className="overflow-y-auto flex-1">
          {events.map((event, index) => (
            <Fragment key={event.id}>
              {index > 0 && <div className="border-b border-neutral-100" />}
              <SearchResultItem
                event={event}
                query={query}
                onClick={() => {
                  onEventSelect(event);
                  onClose();
                }}
              />
            </Fragment>
          ))}
        </div>
      )}

      {/* Footer hint */}
      {!isLoading && events.length > 0 && (
        <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
          <p className="text-xs text-neutral-500 text-center">
            اضغط على النتيجة للانتقال إليها على الخريطة
          </p>
        </div>
      )}
    </div>
  );
}

interface SearchResultItemProps {
  event: Event;
  query: string;
  onClick: () => void;
}

function SearchResultItem({ event, query, onClick }: SearchResultItemProps) {
  const year = new Date(event.startDate).getFullYear();
  const endYear = event.endDate ? new Date(event.endDate).getFullYear() : null;
  const yearDisplay = endYear && endYear !== year ? `${year}-${endYear}` : year;

  // Find matching context in description
  const getMatchContext = (text: string, searchQuery: string): string | null => {
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return null;

    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + searchQuery.length + 30);
    let context = text.slice(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  };

  const descriptionContext = event.description
    ? getMatchContext(event.description, query)
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-start',
        'hover:bg-primary-50 transition-colors',
        'focus:outline-none focus:bg-primary-50'
      )}
      role="option"
    >
      <div className="flex items-start gap-3">
        {/* Type indicator */}
        <div
          className={cn(
            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
            event.type === 'ثورة' && 'bg-red-500',
            event.type === 'معركة' && 'bg-orange-500',
            event.type === 'مقاومة' && 'bg-green-500',
            event.type === 'انتفاضة' && 'bg-blue-500',
            event.type === 'حصار' && 'bg-purple-500'
          )}
        />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-medium text-neutral-900 mb-1">
            {highlightMatch(event.title, query)}
          </h4>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.region?.nameAr || 'غير محدد'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {yearDisplay}
            </span>
            {event.people && event.people.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event.people.length} قائد
              </span>
            )}
          </div>

          {/* Description context with highlighting */}
          {descriptionContext && (
            <p className="text-sm text-neutral-600 line-clamp-1">
              {highlightMatch(descriptionContext, query)}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ArrowLeft className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
