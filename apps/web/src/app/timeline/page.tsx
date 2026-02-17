'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Map, Grid, List, Calendar } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { SearchBar } from '@/components/search';
import { FilterPanel, type FilterValues } from '@/components/filters';
import { Timeline, VerticalTimeline } from '@/components/timeline';
import { useEvents, useSearchEvents } from '@/lib/api/hooks';
import { cn } from '@/lib/utils';
import type { EventCardData } from '@/features/events/EventCard';

// Transform API Event to EventCardData format
function transformEventToCard(event: any): EventCardData {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    regionName: event.region?.nameAr || 'غير محدد',
    startDate: event.startDate,
    endDate: event.endDate || undefined,
    description: event.description,
    reviewStatus: event.reviewStatus === 'CONFIRMED' ? 'مؤكد' :
                  event.reviewStatus === 'NEEDS_REVIEW' ? 'بحاجة_لمراجعة' : 'مسودة',
    leadersCount: event.people?.length || 0,
  };
}

type ViewMode = 'horizontal' | 'vertical-year' | 'vertical-period';

export default function TimelinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});
  const [viewMode, setViewMode] = useState<ViewMode>('horizontal');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch events
  const { data: eventsData, isLoading } = useEvents({
    ...filters,
    limit: 200,
  });

  // Search if query provided
  const { data: searchData, isLoading: searchLoading } = useSearchEvents(
    searchQuery,
    filters
  );

  // Determine which events to display
  const events = useMemo(() => {
    const sourceData = searchQuery.length >= 2
      ? searchData?.data
      : eventsData?.data;

    if (!sourceData) return [];
    return sourceData.map(transformEventToCard);
  }, [searchQuery, searchData, eventsData]);

  const loading = searchQuery.length >= 2 ? searchLoading : isLoading;

  // Handle event selection
  const handleEventSelect = (event: EventCardData) => {
    setSelectedEventId(event.id === selectedEventId ? null : event.id);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                  العودة للخريطة
                </Button>
              </Link>
              <div className="w-px h-6 bg-neutral-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h1 className="font-heading font-bold text-lg text-neutral-900">
                  الجدول الزمني للأحداث
                </h1>
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('horizontal')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'horizontal'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <Grid className="h-4 w-4 inline ml-1" />
                أفقي
              </button>
              <button
                onClick={() => setViewMode('vertical-year')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'vertical-year'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <List className="h-4 w-4 inline ml-1" />
                عمودي
              </button>
              <button
                onClick={() => setViewMode('vertical-period')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'vertical-period'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <Calendar className="h-4 w-4 inline ml-1" />
                حسب الفترة
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ابحث في الأحداث..."
                isLoading={searchLoading}
              />
            </div>
            <FilterPanel
              values={filters}
              onChange={setFilters}
              variant="dropdown"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {events.length} حدث
            </Badge>
            {searchQuery && (
              <span className="text-sm text-neutral-600">
                نتائج البحث عن &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-neutral-600">جاري تحميل الأحداث...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && events.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 font-medium mb-1">لا توجد أحداث</p>
              <p className="text-sm text-neutral-500">
                جرب تعديل معايير البحث أو إزالة الفلاتر
              </p>
            </div>
          </div>
        )}

        {/* Timeline views */}
        {!loading && events.length > 0 && (
          <>
            {viewMode === 'horizontal' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 overflow-hidden">
                <Timeline
                  events={events}
                  onEventSelect={handleEventSelect}
                  selectedEventId={selectedEventId}
                />
              </div>
            )}

            {viewMode === 'vertical-year' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <VerticalTimeline
                  events={events}
                  onEventSelect={handleEventSelect}
                  selectedEventId={selectedEventId}
                  groupBy="year"
                />
              </div>
            )}

            {viewMode === 'vertical-period' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <VerticalTimeline
                  events={events}
                  onEventSelect={handleEventSelect}
                  selectedEventId={selectedEventId}
                  groupBy="period"
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Link back to map */}
      <div className="fixed bottom-6 start-6">
        <Link href="/">
          <Button variant="primary" className="shadow-lg gap-2">
            <Map className="h-4 w-4" />
            عرض على الخريطة
          </Button>
        </Link>
      </div>
    </div>
  );
}
