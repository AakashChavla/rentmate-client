import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiClient,
  apiRequest,
  resetApiClientForTests,
  skipsAuthRefresh,
} from "@/lib/api/client";
import { resetSessionExpiredForTests, setSessionExpiredHandler } from "@/lib/auth/session";

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (requestId) headers.set("X-Request-ID", requestId);
  return new Response(JSON.stringify(body), { status, headers });
}

describe("apiClient", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    resetApiClientForTests();
    resetSessionExpiredForTests();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.history.pushState({}, "", "/admin/dashboard");
  });

  afterEach(() => {
    resetApiClientForTests();
    resetSessionExpiredForTests();
    vi.unstubAllGlobals();
  });

  it("unwraps the success envelope and ignores meta", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { status: "ok" }, meta: { page: 1 } }),
    );

    const result = await apiClient<{ status: string }>("/health");

    expect(result).toEqual({ status: "ok" });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://localhost:3000/api/v1/health");
    expect(init?.credentials).toBe("include");
    const headers = new Headers(init?.headers);
    expect(headers.get("X-Request-ID")).toBeTruthy();
  });

  it("returns a non-envelope JSON body when the call succeeds", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: "ready" }));

    await expect(
      apiClient<{ status: string }>("http://localhost:3000/health/ready"),
    ).resolves.toEqual({ status: "ready" });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:3000/health/ready");
  });

  it("throws ApiError from the error envelope and keeps the response request id", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email",
            details: [{ field: "email", messages: ["Email is required"] }],
          },
          meta: { requestId: "from-meta" },
        },
        422,
        "srv-req-1",
      ),
    );

    const error = await apiClient("/tenants").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Invalid email",
      status: 422,
      requestId: "srv-req-1",
    });
    if (error instanceof ApiError) {
      expect(error.fieldErrors()).toEqual({ email: "Email is required" });
    }
  });

  it("reads the request id from the error meta when the header is missing", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Missing", details: { retryAfterSeconds: 15 } },
          meta: { requestId: "meta-req" },
        },
        404,
      ),
    );

    const error = await apiClient("/users/missing").catch((caught: unknown) => caught);
    expect(error).toMatchObject({ requestId: "meta-req", code: "NOT_FOUND" });
    if (error instanceof ApiError) {
      expect(error.retryAfterSeconds).toBe(15);
    }
  });

  it("returns cursor page meta", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [],
        meta: { page: { limit: 20, hasNext: true, nextCursor: "cursor-2" } },
      }),
    );

    await expect(apiRequest<unknown[]>("/users")).resolves.toMatchObject({
      meta: { page: { hasNext: true, nextCursor: "cursor-2" } },
    });
  });

  it("refreshes once after a 401 and retries the original request", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          { success: false, error: { code: "UNAUTHORIZED", message: "Expired" } },
          401,
        ),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: null }))
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { id: "user_1" }, meta: {} }),
      );

    const result = await apiClient<{ id: string }>("/auth/me");

    expect(result).toEqual({ id: "user_1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3000/api/v1/auth/refresh");
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      credentials: "include",
    });
    expect(fetchMock.mock.calls[2]?.[0]).toBe("http://localhost:3000/api/v1/auth/me");
  });

  it("sends one refresh when three requests fail with 401 together", async () => {
    let refreshCalls = 0;
    const attempts = new Map<string, number>();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/auth/refresh")) {
        refreshCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 15));
        return jsonResponse({ success: true, data: {} });
      }
      const count = attempts.get(url) ?? 0;
      attempts.set(url, count + 1);
      if (count === 0) {
        return jsonResponse(
          { success: false, error: { code: "UNAUTHORIZED", message: "Expired" } },
          401,
        );
      }
      return jsonResponse({ success: true, data: { ok: true } });
    });

    const results = await Promise.all([
      apiClient("/users"),
      apiClient("/roles"),
      apiClient("/permissions"),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
  });

  it("does not refresh auth endpoints", async () => {
    expect(skipsAuthRefresh("/auth/login")).toBe(true);
    expect(skipsAuthRefresh("/auth/refresh")).toBe(true);
    expect(skipsAuthRefresh("/auth/otp/verify")).toBe(true);
    expect(skipsAuthRefresh("/auth/password/reset")).toBe(true);
    expect(skipsAuthRefresh("/auth/me")).toBe(false);

    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          { success: false, error: { code: "INVALID_CREDENTIALS", message: "Bad" } },
          401,
        ),
      ),
    );

    await expect(apiClient("/auth/login", { method: "POST", body: "{}" })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    await expect(apiClient("/auth/otp/verify", { method: "POST", body: "{}" })).rejects.toMatchObject(
      {
        code: "INVALID_CREDENTIALS",
      },
    );
    await expect(
      apiClient("/auth/password/forgot", { method: "POST", body: "{}" }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(fetchMock.mock.calls.every((call) => !String(call[0]).includes("/auth/refresh"))).toBe(
      true,
    );
  });

  it("notifies session expiry once when refresh fails", async () => {
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          { success: false, error: { code: "SESSION_REVOKED", message: "Revoked" } },
          401,
        ),
      ),
    );

    await expect(apiClient("/users")).rejects.toMatchObject({ status: 401 });
    await expect(apiClient("/users")).rejects.toMatchObject({ status: 401 });

    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(onExpired).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("does not redirect when refresh fails on the login screen", async () => {
    window.history.pushState({}, "", "/login");
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          { success: false, error: { code: "UNAUTHORIZED", message: "Expired" } },
          401,
        ),
      )
      .mockResolvedValueOnce(jsonResponse({ success: false }, 401));

    await expect(apiClient("/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(onExpired).not.toHaveBeenCalled();
  });
});
