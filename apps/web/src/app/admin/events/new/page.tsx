'use client';

import { EventForm } from '@/features/events/EventForm';

export default function NewEventPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          إضافة حدث جديد
        </h1>
        <p className="text-neutral-500 mt-1">
          أضف حدثاً تاريخياً جديداً إلى قاعدة البيانات
        </p>
      </div>

      <EventForm mode="create" />
    </div>
  );
}
