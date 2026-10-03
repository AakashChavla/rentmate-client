'use client';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import type { Health } from '../api/health-api';
export function useHealth(): UseQueryResult<Health> {
  const { health } = useServices();
  return useQuery({ queryKey: HEALTH_KEY, queryFn: ({ signal }) => health.ready(signal) });
}
const HEALTH_KEY = ['platform', 'health', 'ready'] as const;
