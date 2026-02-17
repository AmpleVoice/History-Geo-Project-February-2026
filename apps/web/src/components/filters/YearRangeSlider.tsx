'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface YearRangeSliderProps {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

// Significant years for markers
const SIGNIFICANT_YEARS = [
  { year: 1830, label: 'بداية الاحتلال' },
  { year: 1847, label: 'استسلام الأمير' },
  { year: 1871, label: 'ثورة المقراني' },
  { year: 1900, label: '1900' },
  { year: 1945, label: 'مجازر 8 ماي' },
  { year: 1954, label: 'اندلاع الثورة' },
];

export function YearRangeSlider({
  min = 1830,
  max = 1954,
  value,
  onChange,
  className,
}: YearRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = (percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min);
    return Math.round(rawValue);
  };

  const handleMouseDown = (type: 'start' | 'end') => {
    setDragging(type);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      // For RTL, we need to invert the calculation
      const percentage = Math.max(
        0,
        Math.min(100, ((rect.right - e.clientX) / rect.width) * 100)
      );
      const newValue = getValueFromPercentage(percentage);

      setLocalValue((prev) => {
        if (dragging === 'start') {
          const bounded = Math.min(newValue, prev[1] - 1);
          return [Math.max(min, bounded), prev[1]];
        } else {
          const bounded = Math.max(newValue, prev[0] + 1);
          return [prev[0], Math.min(max, bounded)];
        }
      });
    },
    [dragging, min, max]
  );

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      onChange(localValue);
      setDragging(null);
    }
  }, [dragging, localValue, onChange]);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const startPercent = getPercentage(localValue[0]);
  const endPercent = getPercentage(localValue[1]);

  return (
    <div className={cn('py-4', className)}>
      {/* Year labels */}
      <div className="flex justify-between mb-6 text-sm">
        <span className="font-bold text-primary-600">{localValue[1]}</span>
        <span className="text-neutral-400">الفترة الزمنية</span>
        <span className="font-bold text-primary-600">{localValue[0]}</span>
      </div>

      {/* Slider track */}
      <div className="relative px-3">
        <div
          ref={trackRef}
          className="h-2 bg-neutral-200 rounded-full relative"
        >
          {/* Active range */}
          <div
            className="absolute h-full bg-primary-500 rounded-full"
            style={{
              right: `${startPercent}%`,
              left: `${100 - endPercent}%`,
            }}
          />

          {/* Start handle */}
          <button
            type="button"
            onMouseDown={() => handleMouseDown('start')}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary-500 rounded-full',
              'shadow-md cursor-grab active:cursor-grabbing',
              'hover:border-primary-600 hover:scale-110 transition-transform',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              dragging === 'start' && 'scale-110 border-primary-600'
            )}
            style={{ right: `calc(${startPercent}% - 10px)` }}
            aria-label={`من سنة ${localValue[0]}`}
          />

          {/* End handle */}
          <button
            type="button"
            onMouseDown={() => handleMouseDown('end')}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary-500 rounded-full',
              'shadow-md cursor-grab active:cursor-grabbing',
              'hover:border-primary-600 hover:scale-110 transition-transform',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              dragging === 'end' && 'scale-110 border-primary-600'
            )}
            style={{ right: `calc(${endPercent}% - 10px)` }}
            aria-label={`إلى سنة ${localValue[1]}`}
          />
        </div>

        {/* Year markers */}
        <div className="relative mt-2">
          {SIGNIFICANT_YEARS.filter((y) => y.year >= min && y.year <= max).map(
            (marker) => {
              const percent = getPercentage(marker.year);
              return (
                <div
                  key={marker.year}
                  className="absolute transform -translate-x-1/2"
                  style={{ right: `${percent}%` }}
                >
                  <div className="w-px h-2 bg-neutral-300 mx-auto" />
                  <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                    {marker.year}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Duration display */}
      <div className="mt-6 text-center">
        <span className="text-sm text-neutral-600">
          المدة: <span className="font-bold">{localValue[1] - localValue[0]}</span> سنة
        </span>
      </div>
    </div>
  );
}
