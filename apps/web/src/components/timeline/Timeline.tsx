"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn, getEventTypeColor } from "@/lib/utils";
import type { EventCardData } from "@/features/events/EventCard";
import Link from 'next/link';
interface TimelineProps {
  events: EventCardData[];
  onEventSelect?: (event: EventCardData) => void;
  selectedEventId?: string | null;
  className?: string;
}

const MIN_YEAR = 1830;
const MAX_YEAR = 1954;
const YEAR_PADDING = 2;

// Decades for major markers
const DECADES = [
  1830, 1840, 1850, 1860, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950,
];

// Significant historical periods
const PERIODS = [
  {
    start: 1830,
    end: 1847,
    label: "مقاومة الأمير عبد القادر",
    color: "bg-green-100",
  },
  { start: 1848, end: 1870, label: "الثورات المحلية", color: "bg-yellow-100" },
  {
    start: 1871,
    end: 1900,
    label: "ثورات ما بعد المقراني",
    color: "bg-orange-100",
  },
  { start: 1901, end: 1944, label: "الحركة الوطنية", color: "bg-blue-100" },
  { start: 1945, end: 1954, label: "نحو الثورة", color: "bg-red-100" },
];

export function Timeline({
  events,
  onEventSelect,
  selectedEventId,
  className,
}: TimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate timeline width based on zoom
  const timelineWidth =
    (MAX_YEAR - MIN_YEAR + YEAR_PADDING * 2) * 20 * zoomLevel;
  const yearWidth = timelineWidth / (MAX_YEAR - MIN_YEAR);

  // Group events by year
  const eventsByYear = useMemo(() => {
    const grouped: Record<number, EventCardData[]> = {};
    events.forEach((event) => {
      const year = new Date(event.startDate).getFullYear();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(event);
    });
    return grouped;
  }, [events]);

  // Get position for a year
  const getYearPosition = (year: number) => {
    const totalRange = MAX_YEAR - MIN_YEAR + YEAR_PADDING * 2;
    const positionInYears = year - MIN_YEAR + YEAR_PADDING;
    return (positionInYears / totalRange) * 100;
  };

  // Handle zoom
  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) =>
      direction === "in" ? Math.min(prev * 1.5, 4) : Math.max(prev / 1.5, 0.5),
    );
  };

  // Handle scroll
  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.5;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="font-heading font-bold text-neutral-800 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          الجدول الزمني
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 0.5}
            aria-label="تصغير"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-neutral-500 min-w-[50px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom("in")}
            disabled={zoomLevel >= 4}
            aria-label="تكبير"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-neutral-200 mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScroll("right")}
            aria-label="التمرير يميناً"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScroll("left")}
            aria-label="التمرير يساراً"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-custom pb-4"
        style={{ direction: "ltr" }}
      >
        <div
          className="relative"
          style={{ width: `${timelineWidth}px`, minHeight: "300px" }}
        >
          {/* Period backgrounds */}
          <div className="absolute inset-x-0 top-0 h-6">
            {PERIODS.map((period) => (
              <div
                key={period.start}
                className={cn("absolute top-0 h-full", period.color)}
                style={{
                  left: `${getYearPosition(period.start)}%`,
                  width: `${getYearPosition(period.end) - getYearPosition(period.start)}%`,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-600 whitespace-nowrap overflow-hidden px-1">
                  {period.label}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline axis */}
          <div className="absolute left-0 right-0 top-12 h-1 bg-neutral-200" />

          {/* Decade markers */}
          {DECADES.map((decade) => (
            <div
              key={decade}
              className="absolute top-8"
              style={{ left: `${getYearPosition(decade)}%` }}
            >
              <div className="w-px h-8 bg-neutral-300" />
              <span className="absolute top-10 -translate-x-1/2 text-xs font-medium text-neutral-600">
                {decade}
              </span>
            </div>
          ))}

          {/* Events */}
          <div className="absolute inset-x-0 top-24 bottom-0">
            {Object.entries(eventsByYear).map(([year, yearEvents]) => (
              <div
                key={year}
                className="absolute"
                style={{ left: `${getYearPosition(parseInt(year))}%` }}
              >
                {/* Year connector */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-primary-300/50" />

                {/* Events stack */}
                <div className="flex flex-col gap-3 items-start -translate-x-1/2 pt-2">
                  {yearEvents.map((event, idx) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isSelected={event.id === selectedEventId}
                      onClick={() => onEventSelect?.(event)}
                      offset={idx}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 px-4 py-2 bg-neutral-50 rounded-lg">
        <span className="text-xs text-neutral-600 font-medium">
          أنواع الأحداث:
        </span>
        {["ثورة", "معركة", "مقاومة", "انتفاضة", "حصار"].map((type) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                getEventTypeColor(type).split(" ")[0],
              )}
            />
            <span className="text-xs text-neutral-600">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TimelineEventProps {
  event: EventCardData;
  isSelected: boolean;
  onClick: () => void;
  offset: number;
}

function TimelineEvent({
  event,
  isSelected,
  onClick,
  offset,
}: TimelineEventProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const year = new Date(event.startDate).getFullYear();
  const duration = event.endDate
    ? `${year}-${new Date(event.endDate).getFullYear()}`
    : year;

  const isTopEvent = offset === 0;

  return (
    <div
      className="relative"
      style={{
        marginTop: offset > 0 ? "8px" : 0,
        // Increase z-index significantly on hover to beat other stacks
        zIndex: showTooltip ? 100 : isSelected ? 50 : 10,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        href={`/events/${event.id}`}
        onClick={() => onClick()} // Triggers the parent's selectedEventId state
        className={cn(
          "relative px-3 py-2 rounded-lg border-2 transition-all duration-200 cursor-pointer block",
          "hover:shadow-xl hover:-translate-y-0.5",
          isSelected
            ? "border-primary-500 bg-primary-50 shadow-md"
            : "border-neutral-200 bg-white hover:border-primary-400",
          "min-w-[140px] max-w-[220px] w-full",
        )}
        style={{ direction: "rtl" }}
      >
        <div
          className={cn(
            "absolute top-2 end-2 w-2 h-2 rounded-full",
            getEventTypeColor(event.type).split(" ")[0],
          )}
        />
        <h4 className="text-xs font-bold text-neutral-800 pe-4 line-clamp-1 text-start">
          {event.title}
        </h4>
        <p className="text-[10px] text-neutral-500 mt-1 font-medium">
          {duration}
        </p>
      </Link>

      {/* PRO TOOLTIP */}
      {showTooltip && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-[110]",
            "bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-primary-100 p-4",
            "min-w-[260px] max-w-[320px] animate-in fade-in zoom-in duration-150",
            // Directional logic
            isTopEvent ? "top-full mt-3" : "bottom-full mb-3",
          )}
          style={{ direction: "rtl" }}
        >
          {/* Decorative Arrow */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t-2 border-l-2 border-primary-100 rotate-45",
              isTopEvent ? "-top-2" : "-bottom-2 rotate-[225deg]",
            )}
          />

          <div className="relative z-10">
            <Badge
              className={cn("mb-2 text-[10px]", getEventTypeColor(event.type))}
            >
              {event.type}
            </Badge>
            <h5 className="font-bold text-sm text-neutral-900 mb-2 leading-tight">
              {event.title}
            </h5>
            <p className="text-xs text-neutral-700 leading-relaxed mb-3 bg-neutral-50 p-2 rounded-md">
              {event.description}
            </p>
            <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
              <span className="flex items-center gap-1">
                📍 {event.regionName}
              </span>
              <span>📅 {duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
