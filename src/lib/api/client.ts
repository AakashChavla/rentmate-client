import { env } from "@/env";
import { notifySessionExpired } from "@/lib/auth/session";

type ErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
};

export type PageInfo = {
  limit?: number;
  hasNext?: boolean;
  nextCursor?: string | null;
};

export type ApiMeta = {
  requestId?: string;
  timestamp?: string;
  page?: PageInfo;
};

export type ApiResult<T> = {
  data: T;
  meta: ApiMeta;
};

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: ApiMeta;
};

type ErrorEnvelope = {
  success: false;
  error?: ErrorBody;
  meta?: ApiMeta;
};

export type ApiRequestOptions = RequestInit & {
  /** When true, a 401 does not trigger refresh-and-retry. */
  skipAuthRefresh?: boolean;
};

type FieldError = {
  field?: unknown;
  messages?: unknown;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
    requestId?: string;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.requestId = params.requestId;
  }

  /** Maps VALIDATION_ERROR (and the same details shape) onto RHF field names. */
  fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    const errors: Record<string, string> = {};
    for (const item of this.details) {
      if (!isRecord(item)) continue;
      const field = (item as FieldError).field;
      const messages = (item as FieldError).messages;
      if (typeof field !== "string" || !Array.isArray(messages)) continue;
      const text = messages.filter((message): message is string => typeof message === "string");
      if (text.length > 0) errors[field] = text.join(" ");
    }
    return errors;
  }

  get retryAfterSeconds(): number | undefined {
    if (!isRecord(this.details)) return undefined;
    const value = this.details.retryAfterSeconds;
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }
}

let refreshPromise: Promise<boolean> | null = null;

function redirectToLogin(): void {
  notifySessionExpired();
}

let onUnauthorized: () => void = redirectToLogin;

/** @internal Resets module state between tests. */
export function resetApiClientForTests(): void {
  refreshPromise = null;
  onUnauthorized = redirectToLogin;
}

/** @internal Replaces the 401 redirect so tests can observe it. */
export function setUnauthorizedHandlerForTests(handler: () => void): void {
  onUnauthorized = handler;
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}`;
}

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

function apiPathname(path: string): string {
  const withoutQuery = path.split("?")[0] ?? path;
  if (withoutQuery.startsWith("http://") || withoutQuery.startsWith("https://")) {
    const pathname = new URL(withoutQuery).pathname.replace(/^\/api\/v1(?=\/|$)/, "");
    return pathname.length > 0 ? pathname : "/";
  }
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

/**
 * Login, refresh, OTP, and password routes must surface their own 401s.
 * Refreshing them would hide INVALID_CREDENTIALS / OTP_INVALID and can loop.
 */
export function skipsAuthRefresh(path: string): boolean {
  const pathname = apiPathname(path);
  return (
    pathname === "/auth/login" ||
    pathname === "/auth/refresh" ||
    pathname.startsWith("/auth/otp/") ||
    pathname.startsWith("/auth/password/")
  );
}

function readRequestId(response: Response, body: unknown, fallback: string): string {
  const header = response.headers.get("X-Request-ID");
  if (header) return header;
  if (isRecord(body) && isRecord(body.meta) && typeof body.meta.requestId === "string") {
    return body.meta.requestId;
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessEnvelope(value: unknown): value is SuccessEnvelope<unknown> {
  return isRecord(value) && value.success === true && "data" in value;
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return isRecord(value) && value.success === false;
}

function readMeta(body: unknown): ApiMeta {
  if (isRecord(body) && isRecord(body.meta)) {
    return body.meta as ApiMeta;
  }
  return {};
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorFromBody(
  body: unknown,
  status: number,
  requestId: string,
  fallbackMessage: string,
): ApiError {
  if (isErrorEnvelope(body)) {
    return new ApiError({
      code: body.error?.code ?? "REQUEST_FAILED",
      message: body.error?.message ?? fallbackMessage,
      status,
      details: body.error?.details,
      requestId,
    });
  }

  return new ApiError({
    code: "REQUEST_FAILED",
    message: fallbackMessage,
    status,
    requestId,
  });
}

function unwrapResult<T>(body: unknown, response: Response, requestId: string): ApiResult<T> {
  if (isErrorEnvelope(body) || !response.ok) {
    throw errorFromBody(
      body,
      response.status,
      requestId,
      response.statusText || "Request failed",
    );
  }

  if (isSuccessEnvelope(body)) {
    return { data: body.data as T, meta: readMeta(body) };
  }

  return { data: body as T, meta: {} };
}

async function refreshSession(): Promise<boolean> {
  const requestId = createRequestId();
  try {
    const response = await fetch(resolveUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Request-ID": requestId,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function perform<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<ApiResult<T>> {
  const { skipAuthRefresh = false, headers: initHeaders, ...init } = options;
  const requestId = createRequestId();
  const headers = new Headers(initHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Request-ID", requestId);

  let response: Response;
  try {
    response = await fetch(resolveUrl(path), {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (error) {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Network request failed",
      status: 0,
      requestId,
    });
  }

  const allowRefresh = !skipAuthRefresh && !skipsAuthRefresh(path);
  if (response.status === 401 && allowRefresh) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return perform<T>(path, { ...options, skipAuthRefresh: true });
    }
    onUnauthorized();
    const body = await parseBody(response);
    throw errorFromBody(body, 401, readRequestId(response, body, requestId), "Your session has expired");
  }

  const body = await parseBody(response);
  return unwrapResult<T>(body, response, readRequestId(response, body, requestId));
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  return perform<T>(path, options);
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const result = await apiRequest<T>(path, options);
  return result.data;
}
