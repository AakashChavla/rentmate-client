import { HttpUnitsApi } from '../features/units/api/units-api';
import { render, type RenderResult } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { ServicesProvider, type Services } from '../providers/ServicesProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { MotionProvider } from '../providers/MotionProvider';
import { CookieKeyValueStorage } from '../lib/cookie-key-value-storage';
import { AuthProvider } from '../providers/AuthProvider';
import { HttpAuthApi } from '../features/auth/api/auth-api';
import { HttpPropertiesApi } from '../features/properties/api/properties-api';
import { HttpOrganizationApi } from '../features/organization/api/organization-api';
import { HttpInvitationsApi } from '../features/team/api/invitations-api';
import { HttpUsersApi } from '../features/users/api/users-api';
import { SingleFlightRefresh } from '../lib/api/refresh-coordinator';
import { SystemClock } from '../lib/system-clock';
import { FetchHttpClient } from '../lib/api/fetch-http-client';
import { HttpHealthApi } from '../features/platform/api/health-api';
import { CATALOGS } from '../lib/i18n/generated/i18n.generated';
import type { SupportedLocale } from '../config/app.constants';
export function testServices(): Services {
  const http = new FetchHttpClient('http://localhost:3000');
  return {
    http,
    units: new HttpUnitsApi(http),
    properties: new HttpPropertiesApi(http),
    organization: new HttpOrganizationApi(http),
    invitations: new HttpInvitationsApi(http),
    auth: new HttpAuthApi(http),
    users: new HttpUsersApi(http),
    refresh: new SingleFlightRefresh(() => Promise.resolve()),
    health: new HttpHealthApi(http),
    clock: new SystemClock(),
    preferences: new CookieKeyValueStorage(),
  };
}
export function renderApp(
  node: ReactNode,
  locale: SupportedLocale = 'en',
  services = testServices(),
): RenderResult {
  return render(
    <NextIntlClientProvider locale={locale} messages={CATALOGS[locale]}>
      <ThemeProvider>
        <ServicesProvider services={services}>
          <QueryProvider>
            <AuthProvider>
              <MotionProvider>{node}</MotionProvider>
            </AuthProvider>
          </QueryProvider>
        </ServicesProvider>
      </ThemeProvider>
    </NextIntlClientProvider>,
  );
}
