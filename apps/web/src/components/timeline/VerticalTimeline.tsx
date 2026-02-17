'use client';

import { useMemo } from 'react';
import { Calendar, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn, getEventTypeColor, getDateRangeText } from '@/lib/utils';
import type { EventCardData } from '@/features/events/EventCard';
import Link from 'next/link';

interface VerticalTimelineProps {
  events: EventCardData[];
  onEventSelect?: (event: EventCardData) => void;
  selectedEventId?: string | null;
  className?: string;
  groupBy?: 'year' | 'decade' | 'period';
  maxVisible?: number;
}

// Period definitions for grouping
const PERIODS = [
  { start: 1830, end: 1847, label: 'عهد الأمير عبد القادر (1830-1847)' },
  { start: 1848, end: 1870, label: 'الثورات المحلية (1848-1870)' },
  { start: 1871, end: 1900, label: 'ثورات ما بعد المقراني (1871-1900)' },
  { start: 1901, end: 1944, label: 'عهد الحركة الوطنية (1901-1944)' },
  { start: 1945, end: 1954, label: 'مقدمات الثورة (1945-1954)' },
];

export function VerticalTimeline({
  events,
  onEventSelect,
  selectedEventId,
  className,
  groupBy = 'year',
  maxVisible,
}: VerticalTimelineProps) {
  // Sort events by start date
  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [events]);

  // Group events based on groupBy prop
  const groupedEvents = useMemo(() => {
    const groups: { key: string; label: string; events: EventCardData[] }[] = [];

    if (groupBy === 'year') {
      const byYear: Record<number, EventCardData[]> = {};
      sortedEvents.forEach((event) => {
        const year = new Date(event.startDate).getFullYear();
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(event);
      });
      Object.entries(byYear).forEach(([year, yearEvents]) => {
        groups.push({
          key: year,
          label: `${year}م`,
          events: yearEvents,
        });
      });
    } else if (groupBy === 'decade') {
      const byDecade: Record<number, EventCardData[]> = {};
      sortedEvents.forEach((event) => {
        const year = new Date(event.startDate).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        if (!byDecade[decade]) byDecade[decade] = [];
        byDecade[decade].push(event);
      });
      Object.entries(byDecade).forEach(([decade, decadeEvents]) => {
        groups.push({
          key: decade,
          label: `${decade}s`,
          events: decadeEvents,
        });
      });
    } else if (groupBy === 'period') {
      PERIODS.forEach((period) => {
        const periodEvents = sortedEvents.filter((event) => {
          const year = new Date(event.startDate).getFullYear();
          return year >= period.start && year <= period.end;
        });
        if (periodEvents.length > 0) {
          groups.push({
            key: `${period.start}-${period.end}`,
            label: period.label,
            events: periodEvents,
          });
        }
      });
    }

    return groups;
  }, [sortedEvents, groupBy]);

  // Apply maxVisible if specified
  const visibleEvents = maxVisible
    ? sortedEvents.slice(0, maxVisible)
    : sortedEvents;

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute start-4 top-0 bottom-0 w-0.5 bg-neutral-200" />

      {/* Events */}
      <div className="space-y-4">
        {groupBy === 'year' ? (
          // Simple list without grouping headers
          visibleEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onClick={() => onEventSelect?.(event)}
              isFirst={index === 0}
              isLast={index === visibleEvents.length - 1}
            />
          ))
        ) : (
          // Grouped view with headers
          groupedEvents.map((group, groupIndex) => (
            <div key={group.key}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 z-10">
                  <Calendar className="h-4 w-4 text-primary-600" />
                </div>
                <h4 className="font-heading font-bold text-neutral-800 text-sm">
                  {group.label}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {group.events.length} حدث
                </Badge>
              </div>

              {/* Group events */}
              <div className="space-y-3 ps-11">
                {group.events.map((event, eventIndex) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isSelected={event.id === selectedEventId}
                    onClick={() => onEventSelect?.(event)}
                    isFirst={groupIndex === 0 && eventIndex === 0}
                    isLast={
                      groupIndex === groupedEvents.length - 1 &&
                      eventIndex === group.events.length - 1
                    }
                    compact
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show more indicator */}
      {maxVisible && sortedEvents.length > maxVisible && (
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-neutral-500">
            +{sortedEvents.length - maxVisible} أحداث أخرى
          </Badge>
        </div>
      )}
    </div>
  );
}

interface TimelineItemProps {
  event: EventCardData;
  isSelected: boolean;
  onClick: () => void;
  isFirst: boolean;
  isLast: boolean;
  compact?: boolean;
}

function TimelineItem({
  event,
  isSelected,
  onClick,
  isFirst,
  isLast,
  compact = false,
}: TimelineItemProps) {
  const year = new Date(event.startDate).getFullYear();

  return (
    <div className="relative flex gap-3">
      {/* Marker code remains the same... */}
      {!compact && (
        <div className="flex-shrink-0 z-10">
          <div className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white border-neutral-300 hover:border-primary-400'
          )}>
            <div className={cn('w-2 h-2 rounded-full', isSelected ? 'bg-white' : getEventTypeColor(event.type).split(' ')[0])} />
          </div>
        </div>
      )}

      {/* Content Area - SWAP BUTTON FOR LINK */}
      <Link
        href={`/events/${event.id}`}
        onClick={() => onClick()} 
        className={cn(
          'flex-1 text-start p-3 rounded-lg border transition-all block', // Added 'block'
          'hover:shadow-md hover:border-primary-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
          isSelected
            ? 'bg-primary-50 border-primary-300 shadow-md'
            : 'bg-white border-neutral-100',
          compact && 'p-2'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn('font-medium text-neutral-900', compact ? 'text-sm' : '')}>
            {event.title}
          </h4>
          <Badge className={cn(getEventTypeColor(event.type), 'flex-shrink-0 text-xs')}>
            {event.type}
          </Badge>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
            {event.description}
          </p>
        )}

        {/* Meta */}
        <div className={cn('flex flex-wrap gap-3 text-xs text-neutral-500', compact && 'gap-2')}>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {getDateRangeText(event.startDate, event.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.regionName}
          </span>
          {event.leadersCount && event.leadersCount > 0 && !compact && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.leadersCount} قائد
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
