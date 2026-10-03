'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { QUERY } from '../config/app.constants';
import { ApiError } from '../lib/api/api-error';
export function shouldRetry(failureCount: number, error: Error): boolean {
  return (
    !(
      error instanceof ApiError &&
      error.status >= QUERY.CLIENT_ERROR &&
      error.status < QUERY.SERVER_ERROR
    ) && failureCount < QUERY.RETRY_LIMIT
  );
}
export function QueryProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: QUERY.STALE_TIME_MS, retry: shouldRetry },
          mutations: { retry: false },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
