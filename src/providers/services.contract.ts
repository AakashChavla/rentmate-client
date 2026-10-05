import type { HttpClient } from '../lib/api/http-client';
import type { Clock, KeyValueStorage } from '../lib/ports';
import type { HealthApi } from '../features/platform/api/health-api';
import type { AuthApi } from '../features/auth/api/auth-api';
import type { UsersApi } from '../features/users/api/users-api';
import type { RefreshCoordinator } from '../lib/api/refresh-coordinator';
export interface Services {
  http: HttpClient;
  health: HealthApi;
  auth: AuthApi;
  users: UsersApi;
  refresh: RefreshCoordinator;
  clock: Clock;
  preferences: KeyValueStorage;
}
