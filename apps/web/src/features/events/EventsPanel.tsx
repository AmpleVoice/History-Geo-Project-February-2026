'use client';

import { useState, useMemo } from 'react';
import { X, Filter, Calendar, Tag, ChevronDown, Search } from 'lucide-react';
import { Button, Badge, Input } from '@/components/ui';
import { EventCard, type EventCardData } from './EventCard';
import { cn } from '@/lib/utils';
import { EVENT_TYPES } from '@algerian-history/shared';
import { highlightMatch } from '@/components/search';

interface Region {
  id: string;
  nameAr: string;
  code: string;
  eventCount: number;
}

interface EventsPanelProps {
  selectedRegion: Region | null;
  events: EventCardData[];
  onClose?: () => void;
  onEventSelect?: (event: EventCardData) => void;
  selectedEventId?: string | null;
  isLoading?: boolean;
}

export function EventsPanel({
  selectedRegion,
  events,
  onClose,
  onEventSelect,
  selectedEventId,
  isLoading = false,
}: EventsPanelProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ start: 1830, end: 1954 });
  const [localSearch, setLocalSearch] = useState('');

  // Filter events locally (in addition to any server-side filtering)
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(event.type)) {
        return false;
      }

      // Year filter
      const eventYear = new Date(event.startDate).getFullYear();
      if (eventYear < yearRange.start || eventYear > yearRange.end) {
        return false;
      }

      // Local search filter
      if (localSearch) {
        const searchLower = localSearch.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(searchLower);
        const matchesDescription = event.description.toLowerCase().includes(searchLower);
        const matchesRegion = event.regionName.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription && !matchesRegion) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedTypes, yearRange, localSearch]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setYearRange({ start: 1830, end: 1954 });
    setLocalSearch('');
  };

  const hasActiveFilters = selectedTypes.length > 0 || yearRange.start !== 1830 || yearRange.end !== 1954 || localSearch.length > 0;

  return (
    <aside
      className="panel h-full flex flex-col"
      role="complementary"
      aria-label="لوحة الأحداث"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading font-bold text-lg text-neutral-900">
            {selectedRegion ? selectedRegion.nameAr : 'جميع المناطق'}
          </h2>
          {selectedRegion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {selectedRegion && (
          <p className="text-sm text-neutral-600">
            {selectedRegion.eventCount} حدث تاريخي في هذه المنطقة
          </p>
        )}

        {/* Inline Search */}
        <div className="mt-3 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            placeholder="بحث في الأحداث..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={cn(
              'w-full ps-10 pe-4 py-2 border rounded-lg bg-neutral-50',
              'placeholder:text-neutral-400 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white',
              'transition-colors'
            )}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-200"
            >
              <X className="h-3 w-3 text-neutral-500" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <Filter className="h-4 w-4" />
            تصفية
            {(selectedTypes.length > 0 || yearRange.start !== 1830 || yearRange.end !== 1954) && (
              <Badge variant="accent" className="mr-1 text-xs px-1.5">
                {selectedTypes.length + (yearRange.start !== 1830 || yearRange.end !== 1954 ? 1 : 0)}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              مسح
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex-shrink-0 animate-fade-in">
          {/* Event Type Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Tag className="inline h-4 w-4 ml-1" />
              نوع الحدث
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(EVENT_TYPES).map((type) => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? 'primary' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedTypes.includes(type) && 'ring-1 ring-primary-500'
                  )}
                  onClick={() => toggleType(type)}
                  role="checkbox"
                  aria-checked={selectedTypes.includes(type)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleType(type);
                    }
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Year Range Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Calendar className="inline h-4 w-4 ml-1" />
              الفترة الزمنية
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1830}
                max={1954}
                value={yearRange.start}
                onChange={(e) =>
                  setYearRange((prev) => ({
                    ...prev,
                    start: parseInt(e.target.value) || 1830,
                  }))
                }
                className="w-24 text-center"
                aria-label="من سنة"
              />
              <span className="text-neutral-400">—</span>
              <Input
                type="number"
                min={1830}
                max={1954}
                value={yearRange.end}
                onChange={(e) =>
                  setYearRange((prev) => ({
                    ...prev,
                    end: parseInt(e.target.value) || 1954,
                  }))
                }
                className="w-24 text-center"
                aria-label="إلى سنة"
              />
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={event.id === selectedEventId}
                onClick={() => onEventSelect?.(event)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">
              {hasActiveFilters
                ? 'لا توجد أحداث تطابق معايير البحث'
                : 'لا توجد أحداث لعرضها'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mt-2"
              >
                إزالة الفلاتر
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
        <p className="text-xs text-neutral-500 text-center">
          عرض {filteredEvents.length} من أصل {events.length} حدث
        </p>
      </div>
    </aside>
  );
}
