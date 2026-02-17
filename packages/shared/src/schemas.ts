/**
 * Zod validation schemas for the Algerian History Map application
 * مخططات التحقق من صحة البيانات
 */

import { z } from 'zod';
import { EVENT_TYPES_ARRAY, REVIEW_STATUS_ARRAY, SOURCE_TYPES, USER_ROLES } from './types';

// ============================================
// Base Schemas
// ============================================

export const uuidSchema = z.string().uuid();

export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

export const yearRangeSchema = z.number().int().min(1830).max(1954);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ============================================
// Enum Schemas
// ============================================

export const eventTypeSchema = z.enum(EVENT_TYPES_ARRAY as [string, ...string[]]);

export const reviewStatusSchema = z.enum(REVIEW_STATUS_ARRAY as [string, ...string[]]);

export const sourceTypeSchema = z.enum(
  Object.values(SOURCE_TYPES) as [string, ...string[]]
);

export const userRoleSchema = z.enum(
  Object.values(USER_ROLES) as [string, ...string[]]
);

// ============================================
// Entity Schemas
// ============================================

export const eventPartiesSchema = z.object({
  resistance: z.array(z.string()).optional(),
  colonial: z.array(z.string()).optional(),
  other: z.array(z.string()).optional(),
});

export const createEventSchema = z.object({
  title: z.string()
    .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'العنوان يجب ألا يتجاوز 500 حرف'),
  type: eventTypeSchema,
  regionId: uuidSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
  description: z.string()
    .min(20, 'الوصف يجب أن يكون 20 حرفاً على الأقل')
    .max(1000, 'الوصف يجب ألا يتجاوز 1000 حرف'),
  detailedDescription: z.string().max(10000).optional(),
  coordinates: coordinatesSchema.optional(),
  outcome: z.string().max(2000).optional(),
  casualtiesText: z.string().max(500).optional(),
  casualtiesEstimated: z.number().int().positive().optional(),
  parties: eventPartiesSchema.optional(),
  sourceIds: z.array(uuidSchema).optional(),
  personIds: z.array(z.object({
    personId: uuidSchema,
    role: z.string().min(1).max(255),
  })).optional(),
  tagIds: z.array(uuidSchema).optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية', path: ['endDate'] }
).refine(
  (data) => {
    const year = new Date(data.startDate).getFullYear();
    return year >= 1830 && year <= 1954;
  },
  { message: 'التاريخ يجب أن يكون بين 1830 و 1954', path: ['startDate'] }
);

export const updateEventSchema = createEventSchema._def.schema._def.schema.partial().extend({
  id: z.string().uuid(),
});

export const createSourceSchema = z.object({
  title: z.string()
    .min(3, 'عنوان المصدر يجب أن يكون 3 أحرف على الأقل')
    .max(500, 'عنوان المصدر يجب ألا يتجاوز 500 حرف'),
  author: z.string().max(255).optional(),
  year: z.number().int().min(1500).max(2030).optional(),
  publisher: z.string().max(255).optional(),
  type: sourceTypeSchema,
  url: z.string().url().max(1000).optional(),
  isbn: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
}).refine(
  (data) => data.author || data.url || data.publisher,
  { message: 'يجب توفير المؤلف أو الرابط أو الناشر على الأقل' }
);

export const createPersonSchema = z.object({
  nameAr: z.string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(255, 'الاسم يجب ألا يتجاوز 255 حرف'),
  nameEn: z.string().max(255).optional(),
  birthYear: z.number().int().min(1700).max(1954).optional(),
  deathYear: z.number().int().min(1700).max(1970).optional(),
  bio: z.string().max(5000).optional(),
  role: z.string().max(255).optional(),
  imageUrl: z.string().url().max(1000).optional(),
}).refine(
  (data) => {
    if (data.birthYear && data.deathYear) {
      return data.deathYear >= data.birthYear;
    }
    return true;
  },
  { message: 'سنة الوفاة يجب أن تكون بعد أو تساوي سنة الميلاد', path: ['deathYear'] }
);

export const createUserSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم'),
  name: z.string().min(2).max(255),
  role: userRoleSchema,
});

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// ============================================
// Query Schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const eventFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  regionId: uuidSchema.optional(),
  type: z.union([
    eventTypeSchema,
    z.array(eventTypeSchema),
  ]).optional(),
  startYear: z.coerce.number().int().min(1830).max(1954).optional(),
  endYear: z.coerce.number().int().min(1830).max(1954).optional(),
  reviewStatus: reviewStatusSchema.optional(),
}).refine(
  (data) => {
    if (data.startYear && data.endYear) {
      return data.endYear >= data.startYear;
    }
    return true;
  },
  { message: 'سنة النهاية يجب أن تكون بعد أو تساوي سنة البداية' }
);

export const eventListParamsSchema = paginationSchema.merge(eventFiltersSchema._def.schema);

// ============================================
// Type exports from schemas
// ============================================

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type EventListParamsInput = z.infer<typeof eventListParamsSchema>;
