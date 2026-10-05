'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServices } from '../providers/ServicesProvider';
import { useOptionalAuth } from '../providers/AuthProvider';
import { DOMAIN_QUERY, DOMAIN_PERMISSION } from '../config/property.constants';
export function useAccessibleProperties(): ReturnType<
  typeof useInfiniteQuery<Awaited<ReturnType<ReturnType<typeof useServices>['properties']['list']>>>
> {
  const services = useServices();
  const auth = useOptionalAuth();
  return useInfiniteQuery({
    queryKey: [...DOMAIN_QUERY.MINE, auth?.organization?.id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => services.properties.list({ mine: true, cursor: pageParam }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
    enabled: !!auth?.permissions.includes(DOMAIN_PERMISSION.READ),
    retry: false,
  });
}
