'use client';
import { HttpHealthApi, type HealthApi } from '../features/platform/api/health-api';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import type { HttpClient } from '../lib/api/http-client';
import { FetchHttpClient } from '../lib/api/fetch-http-client';
import type { Clock, KeyValueStorage } from '../lib/ports';
import { SystemClock } from '../lib/system-clock';
import { CookieKeyValueStorage } from '../lib/cookie-key-value-storage';
import { environment } from '../lib/env';
export interface Services {
  http: HttpClient;
  health: HealthApi;
  clock: Clock;
  preferences: KeyValueStorage;
}
const ServicesContext = createContext<Services | undefined>(undefined);
export function ServicesProvider({
  children,
  services,
}: {
  children: ReactNode;
  services?: Services;
}): React.JSX.Element {
  const locale = useLocale();
  const http = useMemo(
    () => new FetchHttpClient(environment.NEXT_PUBLIC_API_URL, () => locale),
    [locale],
  );
  const value = useMemo(
    () =>
      services ?? {
        http,
        health: new HttpHealthApi(http),
        clock: new SystemClock(),
        preferences: new CookieKeyValueStorage(),
      },
    [services, http],
  );
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}
export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error(SERVICES_REQUIRED);
  return services;
}
const SERVICES_REQUIRED = 'ServicesProvider is required';
