'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useEvents, useEventStatistics, useRegions } from '@/lib/api';
import { Calendar, MapPin, BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useEventStatistics();
  const { data: eventsData } = useEvents({ limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' });
  const { data: regions } = useRegions();

  const statCards = [
    {
      label: 'إجمالي الأحداث',
      value: stats?.total || 0,
      icon: Calendar,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'المناطق',
      value: regions?.length || 0,
      icon: MapPin,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'أحداث مؤكدة',
      value: stats?.byStatus?.find((s: any) => s.status === 'CONFIRMED')?.count || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'بحاجة لمراجعة',
      value: stats?.byStatus?.find((s: any) => s.status === 'NEEDS_REVIEW')?.count || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          لوحة التحكم
        </h1>
        <p className="text-neutral-500 mt-1">
          مرحباً بك في لوحة إدارة خريطة المقاومات الشعبية
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {statsLoading ? '...' : stat.value}
                    </p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions and recent events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/events/new"
              className="block p-3 bg-primary-50 hover:bg-primary-100 rounded-lg text-primary-700 transition-colors"
            >
              + إضافة حدث جديد
            </Link>
            <Link
              href="/admin/sources/new"
              className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
            >
              + إضافة مصدر جديد
            </Link>
            <Link
              href="/admin/events?status=NEEDS_REVIEW"
              className="block p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 transition-colors"
            >
              مراجعة الأحداث المعلقة
            </Link>
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>آخر التحديثات</CardTitle>
            <Link
              href="/admin/events"
              className="text-sm text-primary-600 hover:underline"
            >
              عرض الكل
            </Link>
          </CardHeader>
          <CardContent>
            {eventsData?.data?.length ? (
              <ul className="space-y-3">
                {eventsData.data.map((event: any) => (
                  <li key={event.id} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        event.reviewStatus === 'CONFIRMED'
                          ? 'bg-green-500'
                          : event.reviewStatus === 'NEEDS_REVIEW'
                          ? 'bg-yellow-500'
                          : 'bg-neutral-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-sm font-medium text-neutral-900 hover:text-primary-600 truncate block"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {event.region?.nameAr}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                لا توجد أحداث بعد
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events by type */}
      {stats?.byType && (
        <Card>
          <CardHeader>
            <CardTitle>الأحداث حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.byType.map((item: any) => (
                <div
                  key={item.type}
                  className="text-center p-3 bg-neutral-50 rounded-lg"
                >
                  <p className="text-2xl font-bold text-neutral-900">
                    {item.count}
                  </p>
                  <p className="text-xs text-neutral-500">{item.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
