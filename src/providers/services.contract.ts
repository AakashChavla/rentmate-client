import type { TenantsApi } from '../features/tenants/api/tenants-api';
import type { LeasesApi } from '../features/leases/api/leases-api';
import type { UnitsApi } from '../features/units/api/units-api';
import type { HttpClient } from '../lib/api/http-client';
import type { Clock, KeyValueStorage } from '../lib/ports';
import type { HealthApi } from '../features/platform/api/health-api';
import type { AuthApi } from '../features/auth/api/auth-api';
import type { UsersApi } from '../features/users/api/users-api';
import type { RefreshCoordinator } from '../lib/api/refresh-coordinator';
import type { PropertiesApi } from '../features/properties/api/properties-api';
import type { OrganizationApi } from '../features/organization/api/organization-api';
import type { InvitationsApi } from '../features/team/api/invitations-api';
export interface Services {
  tenants: TenantsApi;
  leases: LeasesApi;
  units: UnitsApi;
  properties: PropertiesApi;
  organization: OrganizationApi;
  invitations: InvitationsApi;
  http: HttpClient;
  health: HealthApi;
  auth: AuthApi;
  users: UsersApi;
  refresh: RefreshCoordinator;
  clock: Clock;
  preferences: KeyValueStorage;
}
