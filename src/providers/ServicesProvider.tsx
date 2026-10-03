'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { HttpClient } from '../lib/api/http-client';
import { FetchHttpClient } from '../lib/api/fetch-http-client';
import type { Clock, KeyValueStorage } from '../lib/ports';
import { SystemClock } from '../lib/system-clock';
import { CookieKeyValueStorage } from '../lib/cookie-key-value-storage';
import { environment } from '../lib/env';
export interface Services {
  http: HttpClient;
  clock: Clock;
  preferences: KeyValueStorage;
}
const DEFAULT_SERVICES: Services = {
  http: new FetchHttpClient(environment.NEXT_PUBLIC_API_URL),
  clock: new SystemClock(),
  preferences: new CookieKeyValueStorage(),
};
const ServicesContext = createContext<Services>(DEFAULT_SERVICES);
export function ServicesProvider({
  children,
  services = DEFAULT_SERVICES,
}: {
  children: ReactNode;
  services?: Services;
}): React.JSX.Element {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
export function useServices(): Services {
  return useContext(ServicesContext);
}
