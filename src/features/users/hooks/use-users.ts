'use client';
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { AUTH_LIMITS, USERS_QUERY } from '../../../config/auth.constants';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import type { HttpResult } from '../../../lib/api/http-client';
import type { User } from '../api/users-api';

export function useUsers(search: string, status: string): ReturnType<typeof useInfiniteQueryUsers> {
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
    }, AUTH_LIMITS.DEBOUNCE);
    return () => {
      clearTimeout(timeout);
    };
  }, [search]);
  return useInfiniteQueryUsers(debounced, status);
}
function useInfiniteQueryUsers(
  search: string,
  status: string,
): UseInfiniteQueryResult<InfiniteData<HttpResult<User[]>>> {
  const services = useServices();
  return useInfiniteQuery({
    queryKey: [...USERS_QUERY, search, status],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      services.users.list({ search, status, ...(pageParam ? { cursor: pageParam } : {}) }),
    getNextPageParam: (last) =>
      last.meta?.page?.hasNext ? (last.meta.page.nextCursor ?? undefined) : undefined,
    retry: false,
  });
}
