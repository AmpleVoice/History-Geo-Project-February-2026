/**
 * React Query hooks for API data fetching
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  events: {
    all: ['events'] as const,
    list: (params?: Record<string, any>) => ['events', 'list', params] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    byRegion: (regionId: string) => ['events', 'region', regionId] as const,
    statistics: ['events', 'statistics'] as const,
    search: (query: string, filters?: Record<string, any>) => ['events', 'search', query, filters] as const,
  },
  regions: {
    all: ['regions'] as const,
    list: ['regions', 'list'] as const,
    detail: (id: string) => ['regions', 'detail', id] as const,
    byCode: (code: string) => ['regions', 'code', code] as const,
    geojson: ['regions', 'geojson'] as const,
  },
  sources: {
    all: ['sources'] as const,
    list: ['sources', 'list'] as const,
    detail: (id: string) => ['sources', 'detail', id] as const,
    search: (query: string) => ['sources', 'search', query] as const,
  },
  users: {
    all: ['users'] as const,
    list: ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  audit: {
    recent: (limit: number) => ['audit', 'recent', limit] as const,
    byEntity: (type: string, id: string) => ['audit', type, id] as const,
  },
};

// ============================================
// Events Hooks
// ============================================

export function useEvents(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => api.events.list(params),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => api.events.get(id),
    enabled: !!id,
  });
}

export function useEventsByRegion(regionId: string) {
  return useQuery({
    queryKey: queryKeys.events.byRegion(regionId),
    queryFn: () => api.events.getByRegion(regionId),
    enabled: !!regionId,
  });
}

export function useEventStatistics() {
  return useQuery({
    queryKey: queryKeys.events.statistics,
    queryFn: () => api.events.statistics(),
  });
}

export interface SearchFilters {
  type?: string;
  regionId?: string;
  startYear?: number;
  endYear?: number;
  reviewStatus?: string;
}

export function useSearchEvents(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: queryKeys.events.search(query, filters),
    queryFn: () => api.events.list({
      search: query,
      ...filters,
    }),
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.events.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.events.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.events.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.events.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

// ============================================
// Regions Hooks
// ============================================

export function useRegions() {
  return useQuery({
    queryKey: queryKeys.regions.list,
    queryFn: () => api.regions.list(),
  });
}

export function useRegion(id: string) {
  return useQuery({
    queryKey: queryKeys.regions.detail(id),
    queryFn: () => api.regions.get(id),
    enabled: !!id,
  });
}

export function useRegionByCode(code: string) {
  return useQuery({
    queryKey: queryKeys.regions.byCode(code),
    queryFn: () => api.regions.getByCode(code),
    enabled: !!code,
  });
}

export function useRegionsGeoJSON() {
  return useQuery({
    queryKey: queryKeys.regions.geojson,
    queryFn: () => api.regions.geojson(),
  });
}

// ============================================
// Sources Hooks
// ============================================

export function useSources() {
  return useQuery({
    queryKey: queryKeys.sources.list,
    queryFn: () => api.sources.list(),
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: queryKeys.sources.detail(id),
    queryFn: () => api.sources.get(id),
    enabled: !!id,
  });
}

export function useSearchSources(query: string) {
  return useQuery({
    queryKey: queryKeys.sources.search(query),
    queryFn: () => api.sources.search(query),
    enabled: query.length >= 2,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.sources.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
    },
  });
}

// ============================================
// Users Hooks (Admin)
// ============================================

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list,
    queryFn: () => api.users.list(),
  });
}

// ============================================
// Audit Hooks
// ============================================

export function useRecentAuditLogs(limit = 100) {
  return useQuery({
    queryKey: queryKeys.audit.recent(limit),
    queryFn: () => api.audit.recent(limit),
  });
}

export function useEntityAuditLogs(type: string, id: string) {
  return useQuery({
    queryKey: queryKeys.audit.byEntity(type, id),
    queryFn: () => api.audit.byEntity(type, id),
    enabled: !!type && !!id,
  });
}
