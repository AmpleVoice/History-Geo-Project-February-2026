'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from '@/components/ui';
import { useRegions, useSources, useCreateEvent, useUpdateEvent } from '@/lib/api';
import { useAuthStore, isAdmin } from '@/features/auth';
import { cn } from '@/lib/utils';

const EVENT_TYPES = [
  { value: 'REVOLUTION', label: 'ثورة' },
  { value: 'UPRISING', label: 'انتفاضة' },
  { value: 'BATTLE', label: 'معركة' },
  { value: 'SIEGE', label: 'حصار' },
  { value: 'RESISTANCE', label: 'مقاومة' },
  { value: 'RAID', label: 'غزوة' },
];

const REVIEW_STATUSES = [
  { value: 'DRAFT', label: 'مسودة' },
  { value: 'NEEDS_REVIEW', label: 'بحاجة لمراجعة' },
  { value: 'UNVERIFIED', label: 'غير مؤكد' },
  { value: 'CONFIRMED', label: 'مؤكد' },
];

const eventFormSchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل').max(500),
  type: z.enum(['REVOLUTION', 'UPRISING', 'BATTLE', 'SIEGE', 'RESISTANCE', 'RAID']),
  regionId: z.string().uuid('يرجى اختيار منطقة'),
  startDate: z.string().min(1, 'تاريخ البداية مطلوب'),
  endDate: z.string().optional(),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرفاً على الأقل').max(1000),
  detailedDescription: z.string().max(10000).optional(),
  outcome: z.string().max(2000).optional(),
  casualtiesText: z.string().max(500).optional(),
  reviewStatus: z.enum(['DRAFT', 'NEEDS_REVIEW', 'UNVERIFIED', 'CONFIRMED']).optional(),
  sourceIds: z.array(z.string().uuid()).optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: any; // Existing event for editing
  mode: 'create' | 'edit';
}

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: sources, isLoading: sourcesLoading } = useSources();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
          title: event.title,
          type: event.type,
          regionId: event.regionId,
          startDate: event.startDate?.split('T')[0],
          endDate: event.endDate?.split('T')[0] || '',
          description: event.description,
          detailedDescription: event.detailedDescription || '',
          outcome: event.outcome || '',
          casualtiesText: event.casualtiesText || '',
          reviewStatus: event.reviewStatus,
          sourceIds: event.sources?.map((s: any) => s.sourceId) || [],
        }
      : {
          title: '',
          type: 'REVOLUTION',
          regionId: '',
          startDate: '',
          endDate: '',
          description: '',
          detailedDescription: '',
          outcome: '',
          casualtiesText: '',
          reviewStatus: 'DRAFT',
          sourceIds: [],
        },
  });

  const selectedSources = watch('sourceIds') || [];

  const onSubmit = async (data: EventFormData) => {
    try {
      if (mode === 'create') {
        await createEvent.mutateAsync(data);
      } else {
        await updateEvent.mutateAsync({ id: event.id, data });
      }
      router.push('/admin/events');
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const toggleSource = (sourceId: string) => {
    const current = selectedSources;
    if (current.includes(sourceId)) {
      setValue('sourceIds', current.filter((id) => id !== sourceId), { shouldDirty: true });
    } else {
      setValue('sourceIds', [...current, sourceId], { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              عنوان الحدث <span className="text-accent-500">*</span>
            </label>
            <input
              {...register('title')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500',
                errors.title ? 'border-accent-500' : 'border-neutral-300'
              )}
              placeholder="مثال: ثورة الأمير عبد القادر"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-accent-600">{errors.title.message}</p>
            )}
          </div>

          {/* Type and Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                نوع الحدث <span className="text-accent-500">*</span>
              </label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                المنطقة <span className="text-accent-500">*</span>
              </label>
              <select
                {...register('regionId')}
                className={cn(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500',
                  errors.regionId ? 'border-accent-500' : 'border-neutral-300'
                )}
                disabled={regionsLoading}
              >
                <option value="">اختر منطقة...</option>
                {regions?.map((region: any) => (
                  <option key={region.id} value={region.id}>
                    {region.nameAr}
                  </option>
                ))}
              </select>
              {errors.regionId && (
                <p className="mt-1 text-sm text-accent-600">{errors.regionId.message}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                تاريخ البداية <span className="text-accent-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate')}
                min="1830-01-01"
                max="1954-12-31"
                className={cn(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500',
                  errors.startDate ? 'border-accent-500' : 'border-neutral-300'
                )}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-accent-600">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                تاريخ النهاية
              </label>
              <input
                type="date"
                {...register('endDate')}
                min="1830-01-01"
                max="1954-12-31"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>الوصف والتفاصيل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              وصف مختصر <span className="text-accent-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500',
                errors.description ? 'border-accent-500' : 'border-neutral-300'
              )}
              placeholder="وصف موجز للحدث..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-accent-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              وصف تفصيلي
            </label>
            <textarea
              {...register('detailedDescription')}
              rows={6}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="تفاصيل إضافية عن الحدث..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                النتائج والأثر
              </label>
              <textarea
                {...register('outcome')}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="ما هي نتائج هذا الحدث؟"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                الخسائر
              </label>
              <textarea
                {...register('casualtiesText')}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="معلومات عن الخسائر..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle>المصادر</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 mb-4">
            اختر المصادر المرتبطة بهذا الحدث (يجب اختيار مصدر واحد على الأقل للنشر)
          </p>
          {sourcesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sources?.map((source: any) => (
                <label
                  key={source.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedSources.includes(source.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">{source.title}</p>
                    <p className="text-sm text-neutral-500">
                      {source.author && `${source.author} • `}
                      {source.year && `${source.year} • `}
                      {source.publisher}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
          {selectedSources.length === 0 && (
            <p className="text-sm text-yellow-600 mt-2">
              تحذير: لم يتم اختيار أي مصدر. المصادر مطلوبة لنشر الحدث.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Review Status (Admin only) */}
      {mode === 'edit' && isAdmin(user) && (
        <Card>
          <CardHeader>
            <CardTitle>حالة المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              {...register('reviewStatus')}
              className="w-full sm:w-64 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {REVIEW_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-neutral-500 mt-2">
              فقط المدير يمكنه تغيير الحالة إلى &quot;مؤكد&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </Button>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || (!isDirty && mode === 'edit')}
            isLoading={isSubmitting}
          >
            <Save className="w-4 h-4" />
            {mode === 'create' ? 'إنشاء الحدث' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </form>
  );
}
