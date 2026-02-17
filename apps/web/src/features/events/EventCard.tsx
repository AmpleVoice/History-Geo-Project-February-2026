"use client";

import { Card, CardContent, Badge } from "@/components/ui";
import { Calendar, MapPin, Users } from "lucide-react";
import {
  cn,
  getDateRangeText,
  getEventTypeColor,
  getReviewStatusInfo,
} from "@/lib/utils";
import Link from "next/link";
export interface EventCardData {
  id: string;
  title: string;
  type: string;
  regionName: string;
  startDate: string;
  endDate?: string;
  description: string;
  reviewStatus: string;
  leadersCount?: number;
}

interface EventCardProps {
  event: EventCardData;
  onClick?: () => void;
  isSelected?: boolean;
  compact?: boolean;
}

export function EventCard({
  event,
  onClick,
  isSelected = false,
  compact = false,
}: EventCardProps) {
  const statusInfo = getReviewStatusInfo(event.reviewStatus);

  return (
    <Link href={`/events/${event.id}`} className="block no-underline">
      <Card
        variant="interactive"
        className={cn(
          "transition-all",
          isSelected && "ring-2 ring-primary-500 shadow-hover",
          compact ? "p-3" : "",
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-selected={isSelected}
      >
        <CardContent className={compact ? "p-0" : ""}>
          {/* Header with type badge and status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={getEventTypeColor(event.type)}>
              {event.type}
            </Badge>
            {event.reviewStatus !== "مؤكد" && (
              <Badge className={cn("text-xs", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-neutral-900 mb-2 line-clamp-2">
            {event.title}
          </h3>

          {/* Description (only in non-compact mode) */}
          {!compact && (
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Meta info */}
          <div
            className={cn(
              "flex flex-wrap gap-3 text-xs text-neutral-500",
              compact && "mt-2",
            )}
          >
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {getDateRangeText(event.startDate, event.endDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.regionName}
            </span>
            {event.leadersCount && event.leadersCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.leadersCount} قائد
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
