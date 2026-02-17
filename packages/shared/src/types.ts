/**
 * Core type definitions for the Algerian History Map application
 * أنواع البيانات الأساسية لتطبيق خريطة المقاومات الشعبية الجزائرية
 */

// ============================================
// Enums & Constants
// ============================================

/**
 * Event types - أنواع الأحداث
 */
export const EVENT_TYPES = {
  REVOLUTION: 'ثورة',
  UPRISING: 'انتفاضة',
  BATTLE: 'معركة',
  SIEGE: 'حصار',
  RESISTANCE: 'مقاومة',
  RAID: 'غزوة',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const EVENT_TYPES_ARRAY: EventType[] = Object.values(EVENT_TYPES);

/**
 * Review status - حالة المراجعة
 */
export const REVIEW_STATUS = {
  CONFIRMED: 'مؤكد',
  NEEDS_REVIEW: 'بحاجة_لمراجعة',
  UNVERIFIED: 'غير_مؤكد',
  DRAFT: 'مسودة',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const REVIEW_STATUS_ARRAY: ReviewStatus[] = Object.values(REVIEW_STATUS);

/**
 * Source types - أنواع المصادر
 */
export const SOURCE_TYPES = {
  BOOK: 'كتاب',
  ARTICLE: 'مقال',
  ARCHIVE: 'أرشيف',
  ENCYCLOPEDIA: 'موسوعة',
  THESIS: 'رسالة',
  WEBSITE: 'موقع',
  DOCUMENT: 'وثيقة',
} as const;

export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];

/**
 * User roles - أدوار المستخدمين
 */
export const USER_ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================
// Core Interfaces
// ============================================

/**
 * Region/Wilaya - المنطقة/الولاية
 */
export interface Region {
  id: string;
  nameAr: string;
  nameEn?: string;
  code: string;
  geometry?: GeoJSONGeometry;
  centerLat?: number;
  centerLng?: number;
  parentId?: string;
  eventCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GeoJSON geometry type
 */
export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

/**
 * Historical Event - الحدث التاريخي
 */
export interface HistoricalEvent {
  id: string;
  title: string;
  type: EventType;
  regionId: string;
  region?: Region;
  startDate: string; // ISO date string
  endDate?: string;
  description: string;
  detailedDescription?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  outcome?: string;
  casualtiesText?: string;
  casualtiesEstimated?: number;
  parties?: EventParties;
  reviewStatus: ReviewStatus;
  people?: EventPerson[];
  sources?: EventSource[];
  tags?: Tag[];
  createdById: string;
  createdBy?: User;
  updatedById?: string;
  updatedBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parties involved in an event
 */
export interface EventParties {
  resistance?: string[];
  colonial?: string[];
  other?: string[];
}

/**
 * Historical Person - شخصية تاريخية
 */
export interface Person {
  id: string;
  nameAr: string;
  nameEn?: string;
  birthYear?: number;
  deathYear?: number;
  bio?: string;
  role?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Person's role in an event
 */
export interface EventPerson {
  eventId: string;
  personId: string;
  person?: Person;
  role: string;
  notes?: string;
}

/**
 * Source/Citation - المصدر
 */
export interface Source {
  id: string;
  title: string;
  author?: string;
  year?: number;
  publisher?: string;
  type: SourceType;
  url?: string;
  isbn?: string;
  notes?: string;
  createdAt: Date;
}

/**
 * Event-Source relationship with citation details
 */
export interface EventSource {
  eventId: string;
  sourceId: string;
  source?: Source;
  pageRange?: string;
  quote?: string;
  notes?: string;
}

/**
 * Tag - الوسم
 */
export interface Tag {
  id: string;
  nameAr: string;
  nameEn?: string;
  category?: string;
}

/**
 * User - المستخدم
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audit Log Entry - سجل التدقيق
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  user?: User;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

// ============================================
// API Request/Response Types
// ============================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Event filter parameters
 */
export interface EventFilters {
  search?: string;
  regionId?: string;
  type?: EventType | EventType[];
  startYear?: number;
  endYear?: number;
  reviewStatus?: ReviewStatus;
}

/**
 * Event list query parameters
 */
export interface EventListParams extends PaginationParams, EventFilters {}

/**
 * Create event request
 */
export interface CreateEventRequest {
  title: string;
  type: EventType;
  regionId: string;
  startDate: string;
  endDate?: string;
  description: string;
  detailedDescription?: string;
  coordinates?: { lat: number; lng: number };
  outcome?: string;
  casualtiesText?: string;
  casualtiesEstimated?: number;
  parties?: EventParties;
  sourceIds?: string[];
  personIds?: Array<{ personId: string; role: string }>;
  tagIds?: string[];
}

/**
 * Update event request
 */
export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  reviewStatus?: ReviewStatus;
}

/**
 * Create source request
 */
export interface CreateSourceRequest {
  title: string;
  author?: string;
  year?: number;
  publisher?: string;
  type: SourceType;
  url?: string;
  isbn?: string;
  notes?: string;
}

/**
 * Create person request
 */
export interface CreatePersonRequest {
  nameAr: string;
  nameEn?: string;
  birthYear?: number;
  deathYear?: number;
  bio?: string;
  role?: string;
  imageUrl?: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
}

/**
 * API Error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, string[]>;
}

// ============================================
// Map & UI Types
// ============================================

/**
 * Map region feature for GeoJSON
 */
export interface MapRegionFeature {
  type: 'Feature';
  properties: {
    id: string;
    nameAr: string;
    nameEn?: string;
    code: string;
    eventCount: number;
  };
  geometry: GeoJSONGeometry;
}

/**
 * Map tooltip data
 */
export interface RegionTooltipData {
  regionId: string;
  nameAr: string;
  eventCount: number;
  topEvents: Array<{
    id: string;
    title: string;
    type: EventType;
  }>;
}

/**
 * Timeline event for visualization
 */
export interface TimelineEvent {
  id: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  regionName: string;
}
