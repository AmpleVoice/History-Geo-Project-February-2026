/**
 * API Client for Algerian History Map
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class ApiClientError extends Error {
  statusCode: number;
  details?: Record<string, string[]>;

  constructor(message: string, statusCode: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Get stored auth token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Set auth token
 */
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Base fetch wrapper with auth and error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new ApiClientError('Network error', response.status);
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiClientError(
      data.message || 'An error occurred',
      response.status,
      data.details
    );
  }

  return data as T;
}

// ============================================
// API Methods
// ============================================

export const api = {
  // Health check
  health: () => apiFetch<{ status: string }>('/health'),

  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  // Events
  events: {
    list: (params?: Record<string, any>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Map frontend filter name `regionCode` to backend query `regionId`
            const paramKey = key === 'regionCode' ? 'regionId' : key;
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(paramKey, v));
            } else {
              searchParams.set(paramKey, String(value));
            }
          }
        });
      }
      const query = searchParams.toString();
      return apiFetch<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/events${query ? `?${query}` : ''}`);
    },

    get: (id: string) => apiFetch<any>(`/events/${id}`),

    getByRegion: (regionId: string) => apiFetch<any[]>(`/events/region/${regionId}`),

    create: (data: any) =>
      apiFetch<any>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      apiFetch<any>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string) =>
      apiFetch<any>(`/events/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    delete: (id: string) =>
      apiFetch<void>(`/events/${id}`, {
        method: 'DELETE',
      }),

    statistics: () => apiFetch<any>('/events/statistics'),
  },

  // Regions
  regions: {
    list: () => apiFetch<any[]>('/regions'),
    get: (id: string) => apiFetch<any>(`/regions/${id}`),
    getByCode: (code: string) => apiFetch<any>(`/regions/code/${code}`),
    geojson: () => apiFetch<any>('/regions/geojson'),
  },

  // Sources
  sources: {
    list: () => apiFetch<any[]>('/sources'),
    get: (id: string) => apiFetch<any>(`/sources/${id}`),
    search: (query: string) => apiFetch<any[]>(`/sources/search?q=${encodeURIComponent(query)}`),
    create: (data: any) =>
      apiFetch<any>('/sources', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiFetch<any>(`/sources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch<void>(`/sources/${id}`, {
        method: 'DELETE',
      }),
  },

  // Users (admin only)
  users: {
    list: () => apiFetch<any[]>('/users'),
    get: (id: string) => apiFetch<any>(`/users/${id}`),
    create: (data: any) =>
      apiFetch<any>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRole: (id: string, role: string) =>
      apiFetch<any>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },

  // Audit
  audit: {
    recent: (limit = 100) => apiFetch<any[]>(`/audit?limit=${limit}`),
    byEntity: (type: string, id: string) => apiFetch<any[]>(`/audit/${type}/${id}`),
  },
};

export default api;
