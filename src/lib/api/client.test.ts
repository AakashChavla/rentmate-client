import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiClient,
  resetApiClientForTests,
  setUnauthorizedHandlerForTests,
} from "@/lib/api/client";

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (requestId) headers.set("X-Request-ID", requestId);
  return new Response(JSON.stringify(body), { status, headers });
}

describe("apiClient", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    resetApiClientForTests();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    resetApiClientForTests();
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
            details: { field: "email" },
          },
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
      details: { field: "email" },
      requestId: "srv-req-1",
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
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "http://localhost:3000/api/v1/auth/refresh",
    );
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      credentials: "include",
    });
    expect(fetchMock.mock.calls[2]?.[0]).toBe("http://localhost:3000/api/v1/auth/me");
  });

  it("redirects to login when refresh fails and does not retry again", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandlerForTests(onUnauthorized);
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          { success: false, error: { code: "UNAUTHORIZED", message: "Expired" } },
          401,
          "expired-1",
        ),
      )
      .mockResolvedValueOnce(jsonResponse({ success: false }, 401));

    await expect(apiClient("/auth/me")).rejects.toMatchObject({
      status: 401,
      requestId: "expired-1",
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
