'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/components/ui';
import { ImportExport } from '@/components/admin';
import { useEvents, useDeleteEvent, useCreateEvent } from '@/lib/api';
import { useAuthStore, isAdmin } from '@/features/auth';
import { cn, formatDateAr, getEventTypeColor, getReviewStatusInfo } from '@/lib/utils';

const EVENT_TYPES = ['REVOLUTION', 'UPRISING', 'BATTLE', 'SIEGE', 'RESISTANCE', 'RAID'];
const REVIEW_STATUSES = ['CONFIRMED', 'NEEDS_REVIEW', 'UNVERIFIED', 'DRAFT'];

const TYPE_LABELS: Record<string, string> = {
  REVOLUTION: 'ثورة',
  UPRISING: 'انتفاضة',
  BATTLE: 'معركة',
  SIEGE: 'حصار',
  RESISTANCE: 'مقاومة',
  RAID: 'غزوة',
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'مؤكد',
  NEEDS_REVIEW: 'بحاجة لمراجعة',
  UNVERIFIED: 'غير مؤكد',
  DRAFT: 'مسودة',
};

export default function AdminEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const deleteEvent = useDeleteEvent();
  const createEvent = useCreateEvent();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

  // Fetch events
  const { data, isLoading, error } = useEvents({
    page,
    limit: 20,
    search: search || undefined,
    type: typeFilter || undefined,
    reviewStatus: statusFilter || undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`هل تريد حذف "${title}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      try {
        await deleteEvent.mutateAsync(id);
      } catch (err) {
        alert('فشل حذف الحدث');
      }
    }
  };

  // Handle import
  const handleImport = async (importedData: any[], format: 'json' | 'csv') => {
    const results = { success: 0, errors: [] as string[] };

    for (let i = 0; i < importedData.length; i++) {
      const item = importedData[i];
      try {
        // Map CSV/JSON fields to API format
        const eventData = {
          title: item.title || item['العنوان'],
          type: mapTypeLabel(item.type || item['النوع']),
          regionId: item.regionId,
          startDate: item.startDate || item['تاريخ البداية'],
          endDate: item.endDate,
          description: item.description || item['الوصف'] || '',
          detailedDescription: item.detailedDescription,
          outcome: item.outcome,
          casualtiesText: item.casualtiesText,
        };

        // Validate required fields
        if (!eventData.title) {
          results.errors.push(`سطر ${i + 1}: العنوان مطلوب`);
          continue;
        }
        if (!eventData.type) {
          results.errors.push(`سطر ${i + 1}: نوع الحدث غير صالح`);
          continue;
        }
        if (!eventData.startDate) {
          results.errors.push(`سطر ${i + 1}: تاريخ البداية مطلوب`);
          continue;
        }

        await createEvent.mutateAsync(eventData);
        results.success++;
      } catch (err: any) {
        results.errors.push(`سطر ${i + 1}: ${err.message || 'خطأ غير معروف'}`);
      }
    }

    return results;
  };

  // Map Arabic type labels back to enum values
  const mapTypeLabel = (label: string): string | null => {
    const reverseMap: Record<string, string> = {
      'ثورة': 'REVOLUTION',
      'انتفاضة': 'UPRISING',
      'معركة': 'BATTLE',
      'حصار': 'SIEGE',
      'مقاومة': 'RESISTANCE',
      'غزوة': 'RAID',
    };
    return reverseMap[label] || label;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            الأحداث التاريخية
          </h1>
          <p className="text-neutral-500 mt-1">
            إدارة الثورات والمعارك والانتفاضات
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExport
            data={data?.data || []}
            onImport={handleImport}
            entityName="الأحداث"
          />
          <Link href="/admin/events/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              إضافة حدث
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <Card>
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="search"
                placeholder="بحث في الأحداث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button
              type="button"
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              فلاتر
            </Button>
          </form>

          {/* Extended filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  نوع الحدث
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع الأنواع</option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  حالة المراجعة
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع الحالات</option>
                  {REVIEW_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Events table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-start p-4 font-medium text-neutral-600">
                  العنوان
                </th>
                <th className="text-start p-4 font-medium text-neutral-600 hidden sm:table-cell">
                  النوع
                </th>
                <th className="text-start p-4 font-medium text-neutral-600 hidden md:table-cell">
                  المنطقة
                </th>
                <th className="text-start p-4 font-medium text-neutral-600 hidden lg:table-cell">
                  التاريخ
                </th>
                <th className="text-start p-4 font-medium text-neutral-600">
                  الحالة
                </th>
                <th className="text-start p-4 font-medium text-neutral-600 w-24">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-accent-600">
                    فشل تحميل البيانات
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                data?.data?.map((event: any) => (
                  <tr
                    key={event.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="font-medium text-neutral-900 hover:text-primary-600"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-neutral-500 sm:hidden mt-1">
                        {TYPE_LABELS[event.type]} • {event.region?.nameAr}
                      </p>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <Badge className={getEventTypeColor(TYPE_LABELS[event.type])}>
                        {TYPE_LABELS[event.type]}
                      </Badge>
                    </td>
                    <td className="p-4 text-neutral-600 hidden md:table-cell">
                      {event.region?.nameAr}
                    </td>
                    <td className="p-4 text-neutral-600 text-sm hidden lg:table-cell">
                      {event.startDate?.split('T')[0]}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          event.reviewStatus === 'CONFIRMED' && 'bg-green-100 text-green-800',
                          event.reviewStatus === 'NEEDS_REVIEW' && 'bg-yellow-100 text-yellow-800',
                          event.reviewStatus === 'UNVERIFIED' && 'bg-red-100 text-red-800',
                          event.reviewStatus === 'DRAFT' && 'bg-neutral-100 text-neutral-800'
                        )}
                      >
                        {STATUS_LABELS[event.reviewStatus]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {isAdmin(user) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-accent-600 hover:text-accent-700"
                            onClick={() => handleDelete(event.id, event.title)}
                            disabled={deleteEvent.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              عرض {(page - 1) * 20 + 1} - {Math.min(page * 20, data.total)} من {data.total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                disabled={page === data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
