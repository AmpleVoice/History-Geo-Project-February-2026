'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { EventsPanel, type EventCardData } from '@/features/events';
import { useEvents, useSearchEvents, type SearchFilters } from '@/lib/api/hooks';

// Dynamically import the map to avoid SSR issues with Leaflet
const AlgeriaMap = dynamic(
  () => import('@/features/map/AlgeriaMap').then((mod) => mod.AlgeriaMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-neutral-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-neutral-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    ),
  }
);

// Types
interface Region {
  id: string;
  nameAr: string;
  code: string;
  eventCount: number;
}

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

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Fetch events from API
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError
  } = useEvents({
    regionId: selectedRegion?.id,
    ...filters,
    limit: 100,
  });

  // Search events when query is provided
  const {
    data: searchData,
    isLoading: searchLoading
  } = useSearchEvents(searchQuery, filters);

  // Determine which events to display
  const displayedEvents = useMemo(() => {
    const sourceData = searchQuery.length >= 2
      ? searchData?.data
      : eventsData?.data;

    if (!sourceData) return [];
    return sourceData.map(transformEventToCard);
  }, [searchQuery, searchData, eventsData]);

  const isLoading = searchQuery.length >= 2 ? searchLoading : eventsLoading;

  // Handle region selection from map
  const handleRegionSelect = useCallback((region: Region | null) => {
    setSelectedRegion(region);
    setSelectedEventId(null);
    // Clear search when selecting a region
    if (region) {
      setSearchQuery('');
    }
  }, []);

  // Handle region hover from map
  const handleRegionHover = useCallback((region: Region | null) => {
    setHoveredRegion(region);
  }, []);

  // Handle event selection
  const handleEventSelect = useCallback((event: EventCardData) => {
    setSelectedEventId(event.id === selectedEventId ? null : event.id);
  }, [selectedEventId]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Clear region selection when searching
    if (query) {
      setSelectedRegion(null);
    }
  }, []);

  // Total events count
  const totalEvents = searchQuery.length >= 2
    ? searchData?.total
    : eventsData?.total || displayedEvents.length;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header onSearch={handleSearch} searchQuery={searchQuery} />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative">
          <AlgeriaMap
            onRegionSelect={handleRegionSelect}
            onRegionHover={handleRegionHover}
            selectedRegionId={selectedRegion?.code}
            className="w-full h-full"
          />

          {/* Hover tooltip (optional alternative to Leaflet tooltip) */}
          {hoveredRegion && !selectedRegion && (
            <div className="absolute top-4 start-4 bg-white rounded-lg shadow-lg p-3 z-20 animate-fade-in">
              <h4 className="font-heading font-bold text-primary-700">
                {hoveredRegion.nameAr}
              </h4>
              <p className="text-sm text-neutral-600">
                {hoveredRegion.eventCount} حدث تاريخي
              </p>
              <p className="text-xs text-neutral-400 mt-1">انقر للتفاصيل</p>
            </div>
          )}

          {/* Search active indicator */}
          {searchQuery && (
            <div className="absolute top-4 start-4 bg-primary-500 text-white rounded-lg shadow-lg px-4 py-2 z-20 animate-fade-in">
              <p className="text-sm font-medium">
                {isLoading ? 'جاري البحث...' : `${totalEvents} نتيجة لـ "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-[400px] flex-shrink-0 hidden md:block">
          <EventsPanel
            selectedRegion={selectedRegion}
            events={displayedEvents}
            onClose={() => {
              setSelectedRegion(null);
              setSearchQuery('');
            }}
            onEventSelect={handleEventSelect}
            selectedEventId={selectedEventId}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Mobile Panel (bottom sheet style) */}
      <div
        className={`
          md:hidden fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-lg
          transform transition-transform duration-300
          ${selectedRegion || searchQuery ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}
        `}
        style={{ maxHeight: '70vh' }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Summary when collapsed */}
        {!selectedRegion && !searchQuery && (
          <div className="px-4 pb-4">
            <p className="text-center text-neutral-600">
              اختر منطقة من الخريطة لاستكشاف الأحداث
            </p>
            <p className="text-center text-sm text-neutral-400 mt-1">
              {totalEvents || 0} حدث تاريخي متاح
            </p>
          </div>
        )}

        {/* Full panel when region selected or searching */}
        {(selectedRegion || searchQuery) && (
          <div className="h-full overflow-hidden">
            <EventsPanel
              selectedRegion={selectedRegion}
              events={displayedEvents}
              onClose={() => {
                setSelectedRegion(null);
                setSearchQuery('');
              }}
              onEventSelect={handleEventSelect}
              selectedEventId={selectedEventId}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
