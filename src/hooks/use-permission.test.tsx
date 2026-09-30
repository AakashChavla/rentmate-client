import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useCan } from "@/hooks/use-permission";
import type { AuthContextValue } from "@/lib/auth/types";
import type { MeResponse } from "@/lib/api/resources/auth";

const server = setupServer(
  http.get("http://localhost:3000/api/v1/roles", () =>
    HttpResponse.json({
      success: true,
      data: [
        { key: "ORG_OWNER", name: "Owner", permissions: ["user:read"] },
        { key: "PROPERTY_MANAGER", name: "Manager", permissions: ["complaint:read"] },
      ],
      meta: {},
    }),
  ),
);

const user: MeResponse["user"] = {
  id: "user_1",
  email: "demo@rentmate.local",
  fullName: "Demo Owner",
  status: "ACTIVE",
  organizationId: "org_1",
};

function authValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user,
    organization: null,
    roles: [
      { key: "ORG_OWNER", scopeType: "ORGANIZATION", scopeId: "org_1" },
      { key: "PROPERTY_MANAGER", scopeType: "PROPERTY", scopeId: "property-1" },
    ],
    permissions: ["user:read", "complaint:read"],
    isPlatformAdmin: false,
    isLoading: false,
    isAuthenticated: true,
    login: async () => {
      throw new Error("unused");
    },
    logout: async () => undefined,
    refetch: async () => undefined,
    ...overrides,
  };
}

function wrapper(value: AuthContextValue) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AuthProvider value={value}>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe("useCan", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("applies organization scope everywhere and property scope only to its property", async () => {
    const org = renderHook(() => useCan("user:read", { propertyId: "property-2" }), {
      wrapper: wrapper(authValue()),
    });
    const match = renderHook(() => useCan("complaint:read", { propertyId: "property-1" }), {
      wrapper: wrapper(authValue()),
    });
    const miss = renderHook(() => useCan("complaint:read", { propertyId: "property-2" }), {
      wrapper: wrapper(authValue()),
    });

    await waitFor(() => expect(org.result.current).toBe(true));
    await waitFor(() => expect(match.result.current).toBe(true));
    await waitFor(() => expect(miss.result.current).toBe(false));
  });
});
