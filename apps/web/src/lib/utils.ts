import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Arabic locale
 */
export function formatDateAr(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format year only
 */
export function formatYearAr(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-DZ', { year: 'numeric' });
}

/**
 * Get date range text
 */
export function getDateRangeText(startDate: string, endDate?: string): string {
  if (!endDate || startDate === endDate) {
    return formatDateAr(startDate);
  }
  return `${formatDateAr(startDate)} - ${formatDateAr(endDate)}`;
}

/**
 * Get event type color
 */
export function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'ثورة': 'bg-primary-100 text-primary-800',
    'انتفاضة': 'bg-accent-100 text-accent-800',
    'معركة': 'bg-orange-100 text-orange-800',
    'حصار': 'bg-purple-100 text-purple-800',
    'مقاومة': 'bg-blue-100 text-blue-800',
    'غزوة': 'bg-yellow-100 text-yellow-800',
  };
  return colors[type] || 'bg-neutral-100 text-neutral-800';
}

/**
 * Get review status info
 */
export function getReviewStatusInfo(status: string): {
  label: string;
  className: string;
} {
  const statusMap: Record<string, { label: string; className: string }> = {
    'مؤكد': { label: 'مؤكد', className: 'status-confirmed' },
    'بحاجة_لمراجعة': { label: 'بحاجة لمراجعة', className: 'status-review' },
    'غير_مؤكد': { label: 'غير مؤكد', className: 'status-unverified' },
    'مسودة': { label: 'مسودة', className: 'status-draft' },
  };
  return statusMap[status] || { label: status, className: 'badge-neutral' };
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Convert Arabic numbers to Western
 */
export function arabicToWesternNumbers(str: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (d) => arabicNumbers.indexOf(d).toString());
}

/**
 * Convert Western numbers to Arabic
 */
export function westernToArabicNumbers(str: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (d) => arabicNumbers[parseInt(d)]);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
