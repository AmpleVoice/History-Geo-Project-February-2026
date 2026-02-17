'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  FileText,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { Citation, CitationList, type SourceData } from '@/components/citations';
import { useEvent, useEvents } from '@/lib/api/hooks';
import { cn, getEventTypeColor, getDateRangeText, getReviewStatusInfo } from '@/lib/utils';

interface PageProps {
  params: { id: string };
}

export default function EventDetailPage({ params }: PageProps) {
  const id = params.id;
  const router = useRouter();

  const { data: event, isLoading, error } = useEvent(id);
  const { data: allEvents } = useEvents({ limit: 200 });

  // Find previous and next events
  const sortedEvents = allEvents?.data?.sort(
    (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  ) || [];
  const currentIndex = sortedEvents.findIndex((e: any) => e.id === id);
  const prevEvent = currentIndex > 0 ? sortedEvents[currentIndex - 1] : null;
  const nextEvent = currentIndex < sortedEvents.length - 1 ? sortedEvents[currentIndex + 1] : null;

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-600">جاري تحميل الحدث...</p>
        </div>
      </div>
    );
  }

  if (!event && !isLoading) {
    console.error("Event fetch failed:", error);
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 font-medium mb-1">الحدث غير موجود</p>
          <Link href="/">
            <Button variant="primary" className="mt-4">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getReviewStatusInfo(
    event.reviewStatus === 'CONFIRMED' ? 'مؤكد' :
    event.reviewStatus === 'NEEDS_REVIEW' ? 'بحاجة_لمراجعة' : 'مسودة'
  );

  // Transform sources for citation display
  const sources: Array<{ source: SourceData; pageRange?: string }> = (event.sources || []).map(
    (es: any) => ({
      source: {
        id: es.source.id,
        title: es.source.title,
        author: es.source.author,
        year: es.source.year,
        publisher: es.source.publisher,
        type: es.source.type,
        url: es.source.url,
      },
      pageRange: es.pageRange,
    })
  );

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
                العودة للخريطة
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Event header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={getEventTypeColor(event.type)}>
              {event.type}
            </Badge>
            {event.reviewStatus !== 'CONFIRMED' && (
              <Badge className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            )}
          </div>

          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
            {event.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-neutral-600">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {getDateRangeText(event.startDate, event.endDate)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {event.region?.nameAr || 'غير محدد'}
            </span>
            {event.people && event.people.length > 0 && (
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {event.people.length} شخصية
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <Card className="mb-6">
          <CardContent className="prose prose-neutral max-w-none">
            <h2 className="font-heading text-xl font-bold mb-4">نبذة تاريخية</h2>
            <p className="text-neutral-700 leading-relaxed">{event.description}</p>

            {event.detailedDescription && (
              <>
                <h3 className="font-heading text-lg font-bold mt-6 mb-3">تفاصيل إضافية</h3>
                <p className="text-neutral-700 leading-relaxed">{event.detailedDescription}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Outcome */}
        {event.outcome && (
          <Card className="mb-6">
            <CardContent>
              <h2 className="font-heading text-xl font-bold mb-4">النتيجة</h2>
              <p className="text-neutral-700">{event.outcome}</p>
            </CardContent>
          </Card>
        )}

        {/* Casualties */}
        {event.casualtiesText && (
          <Card className="mb-6 border-accent-200 bg-accent-50">
            <CardContent>
              <h2 className="font-heading text-xl font-bold mb-4 text-accent-800">الخسائر البشرية</h2>
              <p className="text-accent-700">{event.casualtiesText}</p>
            </CardContent>
          </Card>
        )}

        {/* People/Leaders */}
        {event.people && event.people.length > 0 && (
          <Card className="mb-6">
            <CardContent>
              <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                الشخصيات المرتبطة
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {event.people.map((ep: any) => (
                  <div
                    key={ep.person.id}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">
                        {ep.person.nameAr}
                      </h4>
                      {ep.role && (
                        <p className="text-sm text-neutral-500">{ep.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sources/Citations */}
        {sources.length > 0 && (
          <Card className="mb-6">
            <CardContent>
              <CitationList sources={sources} />
            </CardContent>
          </Card>
        )}

        {/* No sources warning */}
        {sources.length === 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent>
              <p className="text-yellow-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                لم يتم ربط مصادر بهذا الحدث بعد
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200 print:hidden">
          {prevEvent ? (
            <Link href={`/events/${prevEvent.id}`}>
              <Button variant="ghost" className="gap-2">
                <ChevronRight className="h-4 w-4" />
                <span className="hidden sm:inline">{prevEvent.title}</span>
                <span className="sm:hidden">السابق</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <Link href="/">
            <Button variant="secondary">عرض على الخريطة</Button>
          </Link>

          {nextEvent ? (
            <Link href={`/events/${nextEvent.id}`}>
              <Button variant="ghost" className="gap-2">
                <span className="hidden sm:inline">{nextEvent.title}</span>
                <span className="sm:hidden">التالي</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      {/* Footer meta */}
      <footer className="bg-white border-t border-neutral-200 py-4 mt-8 print:hidden">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-neutral-500">
          <p>
            آخر تحديث:{' '}
            {new Date(event.updatedAt || event.createdAt).toLocaleDateString('ar-DZ')}
          </p>
        </div>
      </footer>
    </div>
  );
}
