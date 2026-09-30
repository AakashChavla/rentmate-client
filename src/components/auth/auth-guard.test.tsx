import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthProvider } from "@/components/providers/auth-provider";
import type { MeResponse } from "@/lib/api/resources/auth";
import type { AuthContextValue } from "@/lib/auth/types";

const replaceMock = vi.hoisted(() => vi.fn());
const pathState = vi.hoisted(() => ({ current: "/admin/dashboard" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => pathState.current,
}));

const user: MeResponse["user"] = {
  id: "user_1",
  email: "demo@rentmate.local",
  fullName: "Demo",
  status: "ACTIVE",
  organizationId: "org_1",
};

function authValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    user,
    organization: null,
    roles: [{ key: "ORG_OWNER", scopeType: "ORGANIZATION", scopeId: "org_1" }],
    permissions: [],
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

describe("AuthGuard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    pathState.current = "/admin/dashboard";
  });

  it("shows a skeleton while the session loads", () => {
    const { container } = render(
      <AuthProvider value={authValue({ isLoading: true, isAuthenticated: false, user: null })}>
        <AuthGuard allow="admin">
          <p>Admin</p>
        </AuthGuard>
      </AuthProvider>,
    );
    expect(container.querySelector("[aria-busy='true']")).toBeTruthy();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("sends an anonymous visitor to login", () => {
    render(
      <AuthProvider value={authValue({ isAuthenticated: false, user: null, roles: [] })}>
        <AuthGuard allow="admin">
          <p>Admin</p>
        </AuthGuard>
      </AuthProvider>,
    );
    expect(replaceMock).toHaveBeenCalledWith("/login?next=%2Fadmin%2Fdashboard");
  });

  it("sends a tenant away from the admin portal", () => {
    render(
      <AuthProvider
        value={authValue({
          roles: [{ key: "TENANT", scopeType: "ORGANIZATION", scopeId: "org_1" }],
        })}
      >
        <AuthGuard allow="admin">
          <p>Admin</p>
        </AuthGuard>
      </AuthProvider>,
    );
    expect(replaceMock).toHaveBeenCalledWith("/tenant/dashboard");
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("sends an operator away from the tenant portal", () => {
    pathState.current = "/tenant/dashboard";
    render(
      <AuthProvider value={authValue({})}>
        <AuthGuard allow="tenant">
          <p>Tenant</p>
        </AuthGuard>
      </AuthProvider>,
    );
    expect(replaceMock).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("renders the matching portal", () => {
    render(
      <AuthProvider value={authValue({})}>
        <AuthGuard allow="admin">
          <p>Admin</p>
        </AuthGuard>
      </AuthProvider>,
    );
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
