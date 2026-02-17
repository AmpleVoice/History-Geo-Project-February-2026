'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Edit, Calendar, MapPin, User, BookOpen, CheckCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useEvent } from '@/lib/api';
import { formatDateAr, getEventTypeColor, cn } from '@/lib/utils';
import { useAuthStore, isAdmin } from '@/features/auth';

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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: event, isLoading, error } = useEvent(params.id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-accent-600 mb-4">فشل تحميل الحدث</p>
        <Button variant="secondary" onClick={() => router.back()}>
          رجوع
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getEventTypeColor(TYPE_LABELS[event.type])}>
              {TYPE_LABELS[event.type]}
            </Badge>
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
          </div>
        </div>
        <Link href={`/admin/events/${event.id}/edit`}>
          <Button variant="primary">
            <Edit className="w-4 h-4" />
            تعديل
          </Button>
        </Link>
      </div>

      {/* Basic Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">المنطقة</p>
                <p className="font-medium text-neutral-900">{event.region?.nameAr}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">التاريخ</p>
                <p className="font-medium text-neutral-900">
                  {event.startDate?.split('T')[0]}
                  {event.endDate && ` - ${event.endDate?.split('T')[0]}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-neutral-500">أنشأه</p>
                <p className="font-medium text-neutral-900">
                  {event.createdBy?.name || 'غير معروف'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>الوصف</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 leading-relaxed">{event.description}</p>
          {event.detailedDescription && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-sm font-medium text-neutral-500 mb-2">التفاصيل</p>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {event.detailedDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outcome and Casualties */}
      {(event.outcome || event.casualtiesText) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {event.outcome && (
            <Card>
              <CardHeader>
                <CardTitle>النتائج والأثر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700">{event.outcome}</p>
              </CardContent>
            </Card>
          )}
          {event.casualtiesText && (
            <Card>
              <CardHeader>
                <CardTitle>الخسائر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700">{event.casualtiesText}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* People */}
      {event.people?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الشخصيات المشاركة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.people.map((ep: any) => (
                <div
                  key={ep.personId}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {ep.person?.nameAr}
                    </p>
                    <p className="text-sm text-neutral-500">{ep.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            المصادر
          </CardTitle>
        </CardHeader>
        <CardContent>
          {event.sources?.length > 0 ? (
            <div className="space-y-3">
              {event.sources.map((es: any) => (
                <div
                  key={es.sourceId}
                  className="p-3 bg-neutral-50 rounded-lg"
                >
                  <p className="font-medium text-neutral-900">
                    {es.source?.title}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {es.source?.author && `${es.source.author} • `}
                    {es.source?.year && `${es.source.year} • `}
                    {es.source?.publisher}
                  </p>
                  {es.pageRange && (
                    <p className="text-sm text-neutral-500 mt-1">
                      الصفحات: {es.pageRange}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">لا توجد مصادر مرتبطة</p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span>
              تاريخ الإنشاء:{' '}
              {new Date(event.createdAt).toLocaleDateString('ar-DZ')}
            </span>
            <span>
              آخر تحديث:{' '}
              {new Date(event.updatedAt).toLocaleDateString('ar-DZ')}
            </span>
            {event.updatedBy && (
              <span>آخر تعديل بواسطة: {event.updatedBy.name}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
