'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { createServices } from './create-services';
import type { Services } from './services.contract';
import { environment } from '../lib/env';
export type { Services } from './services.contract';
const ServicesContext = createContext<Services | undefined>(undefined);
export function ServicesProvider({
  children,
  services,
}: {
  children: ReactNode;
  services?: Services;
}): React.JSX.Element {
  const locale = useLocale();
  const value = useMemo(
    () => services ?? createServices(environment.NEXT_PUBLIC_API_URL, () => locale),
    [services, locale],
  );
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}
export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error(SERVICES_REQUIRED);
  return services;
}
const SERVICES_REQUIRED = 'ServicesProvider is required';
