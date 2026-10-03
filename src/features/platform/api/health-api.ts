import type { HttpClient } from '../../../lib/api/http-client';
import type { paths } from '../../../lib/api/schema';
import { ROUTES } from '../../../config/app.constants';
export type Health = paths['/health/ready']['get']['responses'][200]['content']['application/json'];
export interface HealthApi {
  ready(signal?: AbortSignal): Promise<Health>;
}
export class HttpHealthApi implements HealthApi {
  public constructor(private readonly http: HttpClient) {}
  public async ready(signal?: AbortSignal): Promise<Health> {
    return (await this.http.get<Health>(ROUTES.READY, signal)).data;
  }
}
