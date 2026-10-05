import type { AuthApi, Me } from '../features/auth/api/auth-api';
import type { RefreshCoordinator } from '../lib/api/refresh-coordinator';
import { ApiError } from '../lib/api/api-error';
import { API_STATUS } from '../config/app.constants';
export async function loadIdentity(auth: AuthApi, refresh: RefreshCoordinator): Promise<Me | null> {
  try {
    return await auth.me();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== API_STATUS.UNAUTHORIZED) throw error;
    await refresh.refresh();
    try {
      return await auth.me();
    } catch (retry) {
      refresh.expire();
      throw retry;
    }
  }
}
