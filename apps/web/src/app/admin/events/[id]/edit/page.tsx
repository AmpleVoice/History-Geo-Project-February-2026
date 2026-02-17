'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvent } from '@/lib/api';
import { EventForm } from '@/features/events/EventForm';
import { Button } from '@/components/ui';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          تعديل الحدث
        </h1>
        <p className="text-neutral-500 mt-1">
          {event.title}
        </p>
      </div>

      <EventForm event={event} mode="edit" />
    </div>
  );
}
