import { HttpUnitsApi } from '../features/units/api/units-api';
import type { Services } from './services.contract';
import { FetchHttpClient } from '../lib/api/fetch-http-client';
import { SingleFlightRefresh } from '../lib/api/refresh-coordinator';
import { HttpAuthApi } from '../features/auth/api/auth-api';
import { HttpPropertiesApi } from '../features/properties/api/properties-api';
import { HttpOrganizationApi } from '../features/organization/api/organization-api';
import { HttpInvitationsApi } from '../features/team/api/invitations-api';
import { HttpUsersApi } from '../features/users/api/users-api';
import { HttpHealthApi } from '../features/platform/api/health-api';
import { SystemClock } from '../lib/system-clock';
import { CookieKeyValueStorage } from '../lib/cookie-key-value-storage';
export function createServices(base: string, locale: () => string): Services {
  const auth = new HttpAuthApi(new FetchHttpClient(base, locale));
  const refresh = new SingleFlightRefresh(() => auth.refresh());
  const http = new FetchHttpClient(base, locale, refresh);
  return {
    http,
    units: new HttpUnitsApi(http),
    properties: new HttpPropertiesApi(http),
    organization: new HttpOrganizationApi(http),
    invitations: new HttpInvitationsApi(http),
    auth,
    refresh,
    users: new HttpUsersApi(http),
    health: new HttpHealthApi(http),
    clock: new SystemClock(),
    preferences: new CookieKeyValueStorage(),
  };
}
