'use client';

import { useState, useEffect } from 'react';
import {
  Filter,
  X,
  Calendar,
  MapPin,
  Tag,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { EVENT_TYPES, REVIEW_STATUS } from '@algerian-history/shared';
import { useRegions } from '@/lib/api/hooks';

export interface FilterValues {
  type?: string;
  regionCode?: string;
  startYear?: number;
  endYear?: number;
  reviewStatus?: string;
}

interface FilterPanelProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  className?: string;
  variant?: 'inline' | 'dropdown';
}

const MIN_YEAR = 1830;
const MAX_YEAR = 1954;

// Arabic labels for event types
const EVENT_TYPE_LABELS: Record<string, string> = {
  REVOLUTION: 'ثورة',
  BATTLE: 'معركة',
  RESISTANCE: 'مقاومة',
  UPRISING: 'انتفاضة',
  SIEGE: 'حصار',
};

// Arabic labels for review status
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  NEEDS_REVIEW: 'بحاجة لمراجعة',
  CONFIRMED: 'مؤكد',
};

export function FilterPanel({
  values,
  onChange,
  className,
  variant = 'inline',
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: regions } = useRegions();

  // Count active filters
  const activeFilterCount = [
    values.type,
    values.regionCode,
    values.startYear !== MIN_YEAR ? values.startYear : undefined,
    values.endYear !== MAX_YEAR ? values.endYear : undefined,
    values.reviewStatus,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const handleReset = () => {
    onChange({});
  };

  const handleChange = (key: keyof FilterValues, value: any) => {
    onChange({
      ...values,
      [key]: value || undefined,
    });
  };

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        {/* Toggle button */}
        <Button
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          تصفية
          {hasActiveFilters && (
            <Badge variant="accent" className="text-xs px-1.5 py-0">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>

        {/* Dropdown panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <div className="absolute top-full mt-2 end-0 z-50 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg animate-fade-in">
              <FilterPanelContent
                values={values}
                onChange={onChange}
                regions={regions}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn('bg-white border-b border-neutral-100', className)}>
      <FilterPanelContent
        values={values}
        onChange={onChange}
        regions={regions}
        inline
      />
    </div>
  );
}

interface FilterPanelContentProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  regions?: any[];
  onClose?: () => void;
  inline?: boolean;
}

function FilterPanelContent({
  values,
  onChange,
  regions,
  onClose,
  inline,
}: FilterPanelContentProps) {
  const [localStartYear, setLocalStartYear] = useState(
    values.startYear || MIN_YEAR
  );
  const [localEndYear, setLocalEndYear] = useState(values.endYear || MAX_YEAR);

  // Sync local state with props
  useEffect(() => {
    setLocalStartYear(values.startYear || MIN_YEAR);
    setLocalEndYear(values.endYear || MAX_YEAR);
  }, [values.startYear, values.endYear]);

  const handleYearChange = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
      setLocalStartYear(value);
      if (value !== MIN_YEAR) {
        onChange({ ...values, startYear: value });
      } else {
        const { startYear, ...rest } = values;
        onChange(rest);
      }
    } else {
      setLocalEndYear(value);
      if (value !== MAX_YEAR) {
        onChange({ ...values, endYear: value });
      } else {
        const { endYear, ...rest } = values;
        onChange(rest);
      }
    }
  };

  const handleReset = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(values).some(Boolean);

  return (
    <div className={cn(inline ? 'p-4' : 'p-4')}>
      {/* Header */}
      {!inline && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <h3 className="font-medium text-neutral-900">تصفية الأحداث</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      )}

      <div className={cn('space-y-4', inline && 'md:flex md:gap-4 md:space-y-0 md:items-end')}>
        {/* Event Type Filter */}
        <div className={cn(inline && 'flex-1')}>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Tag className="inline h-4 w-4 ml-1" />
            نوع الحدث
          </label>
          <select
            value={values.type || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                onChange({ ...values, type: val });
              } else {
                const { type, ...rest } = values;
                onChange(rest);
              }
            }}
            className={cn(
              'w-full px-3 py-2 border rounded-lg bg-white text-neutral-900',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              values.type ? 'border-primary-300' : 'border-neutral-200'
            )}
          >
            <option value="">جميع الأنواع</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className={cn(inline && 'flex-1')}>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <MapPin className="inline h-4 w-4 ml-1" />
            المنطقة
          </label>
          <select
            value={values.regionCode || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                onChange({ ...values, regionCode: val });
              } else {
                const { regionCode, ...rest } = values;
                onChange(rest);
              }
            }}
            className={cn(
              'w-full px-3 py-2 border rounded-lg bg-white text-neutral-900',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              values.regionCode ? 'border-primary-300' : 'border-neutral-200'
            )}
          >
            <option value="">جميع المناطق</option>
            {regions?.map((region) => (
              <option key={region.code} value={region.code}>
                {region.nameAr}
              </option>
            ))}
          </select>
        </div>

        {/* Year Range Filter */}
        <div className={cn(inline && 'flex-1')}>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            <Calendar className="inline h-4 w-4 ml-1" />
            الفترة الزمنية
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={localStartYear}
              onChange={(e) =>
                handleYearChange('start', parseInt(e.target.value) || MIN_YEAR)
              }
              className={cn(
                'w-20 px-2 py-2 border rounded-lg bg-white text-neutral-900 text-center',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                localStartYear !== MIN_YEAR
                  ? 'border-primary-300'
                  : 'border-neutral-200'
              )}
              aria-label="من سنة"
            />
            <span className="text-neutral-400 flex-shrink-0">—</span>
            <input
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={localEndYear}
              onChange={(e) =>
                handleYearChange('end', parseInt(e.target.value) || MAX_YEAR)
              }
              className={cn(
                'w-20 px-2 py-2 border rounded-lg bg-white text-neutral-900 text-center',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                localEndYear !== MAX_YEAR
                  ? 'border-primary-300'
                  : 'border-neutral-200'
              )}
              aria-label="إلى سنة"
            />
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <div className={cn(inline ? 'flex-shrink-0' : 'pt-2')}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1 text-neutral-600"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين
            </Button>
          </div>
        )}
      </div>

      {/* Active filters summary */}
      {!inline && hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 mb-2">الفلاتر النشطة:</p>
          <div className="flex flex-wrap gap-2">
            {values.type && (
              <Badge variant="primary" className="gap-1">
                {EVENT_TYPE_LABELS[values.type]}
                <button
                  onClick={() => {
                    const { type, ...rest } = values;
                    onChange(rest);
                  }}
                  className="hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {values.regionCode && regions && (
              <Badge variant="primary" className="gap-1">
                {regions.find((r) => r.code === values.regionCode)?.nameAr}
                <button
                  onClick={() => {
                    const { regionCode, ...rest } = values;
                    onChange(rest);
                  }}
                  className="hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(values.startYear || values.endYear) && (
              <Badge variant="primary" className="gap-1">
                {values.startYear || MIN_YEAR} - {values.endYear || MAX_YEAR}
                <button
                  onClick={() => {
                    const { startYear, endYear, ...rest } = values;
                    onChange(rest);
                  }}
                  className="hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
