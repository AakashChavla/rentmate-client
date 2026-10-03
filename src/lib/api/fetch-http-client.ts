import { ERROR_CODES, HTTP_HEADERS, HTTP_METHODS } from '../../config/app.constants';
import { ApiError } from './api-error';
import type { HttpClient, HttpResult } from './http-client';
export class FetchHttpClient implements HttpClient {
  public constructor(private readonly baseUrl: string) {}
  public async get<T>(path: string, signal?: AbortSignal): Promise<HttpResult<T>> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: HTTP_METHODS.GET,
      credentials: 'include',
      ...(signal ? { signal } : {}),
      headers: { [HTTP_HEADERS.REQUEST_ID]: crypto.randomUUID() },
    });
    const requestId = response.headers.get(HTTP_HEADERS.REQUEST_ID);
    if (!response.ok) throw new ApiError(ERROR_CODES.HTTP_ERROR, response.status, requestId);
    const data: unknown = await response.json();
    return { data: data as T, requestId };
  }
}
