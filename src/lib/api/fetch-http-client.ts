import {
  ERROR_CODES,
  HTTP_HEADERS,
  HTTP_METHODS,
  API_STATUS,
  DEFAULT_LOCALE,
} from '../../config/app.constants';
import { ApiError, type FieldError } from './api-error';
import type { HttpClient, HttpResult } from './http-client';
import type { RefreshCoordinator } from './refresh-coordinator';
import { parseEnvelopeMeta } from './envelope-meta';
import { AUTH_API } from '../../config/auth.constants';
interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}
function isFieldError(field: unknown): field is FieldError {
  if (!field || typeof field !== 'object') return false;
  const item = field as Record<string, unknown>;
  return (
    typeof item.field === 'string' &&
    typeof item.code === 'string' &&
    typeof item.message === 'string'
  );
}
function parseFields(value: unknown): FieldError[] {
  return Array.isArray(value) ? value.filter(isFieldError) : [];
}
function apiError(body: unknown, response: Response, requestId: string | null): ApiError {
  const error = body && typeof body === 'object' ? (body as ErrorBody) : {};
  const retry = response.headers.get(HTTP_HEADERS.RETRY_AFTER);
  return new ApiError(
    error.error?.code ?? ERROR_CODES.HTTP_ERROR,
    response.status,
    requestId,
    error.error?.message,
    parseFields(error.error?.details),
    retry === null ? null : Number(retry),
  );
}
export class FetchHttpClient implements HttpClient {
  public constructor(
    private readonly baseUrl: string,
    private readonly locale: () => string = () => DEFAULT_LOCALE,
    private readonly refresh?: RefreshCoordinator,
  ) {}
  public async get<T>(path: string, signal?: AbortSignal): Promise<HttpResult<T>> {
    return this.perform<T>(path, HTTP_METHODS.GET, undefined, signal);
  }
  public post<T>(path: string, body?: unknown): Promise<HttpResult<T>> {
    return this.perform<T>(path, HTTP_METHODS.POST, body);
  }
  public patch<T>(path: string, body: unknown): Promise<HttpResult<T>> {
    return this.perform<T>(path, HTTP_METHODS.PATCH, body);
  }
  public delete<T>(path: string): Promise<HttpResult<T>> {
    return this.perform<T>(path, HTTP_METHODS.DELETE);
  }
  private async perform<T>(
    path: string,
    method: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<HttpResult<T>> {
    const response = await this.request(path, signal, method, body);
    if (
      response.status === API_STATUS.UNAUTHORIZED &&
      this.refresh?.enabled &&
      !new URL(path, this.baseUrl).pathname.startsWith(AUTH_API.PREFIX)
    ) {
      await this.refresh.refresh();
      const retry = await this.request(path, signal, method, body);
      if (retry.status === API_STATUS.UNAUTHORIZED) this.refresh.expire();
      return this.read<T>(retry);
    }
    return this.read<T>(response);
  }
  private request(
    path: string,
    signal: AbortSignal | undefined,
    method: string,
    body: unknown,
  ): Promise<Response> {
    return fetch(new URL(path, this.baseUrl), {
      method,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      credentials: 'include',
      ...(signal ? { signal } : {}),
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        [HTTP_HEADERS.REQUEST_ID]: crypto.randomUUID(),
        [HTTP_HEADERS.ACCEPT_LANGUAGE]: this.locale(),
      },
    });
  }
  private async read<T>(response: Response): Promise<HttpResult<T>> {
    const requestId = response.headers.get(HTTP_HEADERS.REQUEST_ID);
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) throw apiError(body, response, requestId);
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      body.success === true &&
      'data' in body
    ) {
      const meta = parseEnvelopeMeta('meta' in body ? body.meta : undefined);
      return { data: body.data as T, requestId, ...(meta ? { meta } : {}) };
    }
    return { data: body as T, requestId };
  }
}
