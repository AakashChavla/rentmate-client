import { env } from "@/env";
import { LOGIN_PATH } from "@/lib/auth/constants";

type ErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
};

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: unknown;
};

type ErrorEnvelope = {
  success: false;
  error?: ErrorBody;
};

export type ApiRequestOptions = RequestInit & {
  /** When true, a 401 does not trigger refresh-and-retry. */
  skipAuthRefresh?: boolean;
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
}

let refreshPromise: Promise<boolean> | null = null;

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_PATH) return;
  window.location.assign(LOGIN_PATH);
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

function readRequestId(response: Response, fallback: string): string {
  return response.headers.get("X-Request-ID") ?? fallback;
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

function unwrap<T>(body: unknown, response: Response, requestId: string): T {
  if (isErrorEnvelope(body)) {
    throw errorFromBody(
      body,
      response.status,
      requestId,
      response.statusText || "Request failed",
    );
  }

  if (!response.ok) {
    throw errorFromBody(
      body,
      response.status,
      requestId,
      response.statusText || "Request failed",
    );
  }

  if (isSuccessEnvelope(body)) {
    return body.data as T;
  }

  return body as T;
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

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
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

  if (response.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return apiClient<T>(path, { ...options, skipAuthRefresh: true });
    }
    onUnauthorized();
    const body = await parseBody(response);
    throw errorFromBody(
      body,
      401,
      readRequestId(response, requestId),
      "Your session has expired",
    );
  }

  const body = await parseBody(response);
  return unwrap<T>(body, response, readRequestId(response, requestId));
}
