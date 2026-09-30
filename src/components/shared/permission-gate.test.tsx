import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PermissionGate } from "@/components/shared/permission-gate";
import type { MeResponse } from "@/lib/api/resources/auth";
import type { AuthContextValue } from "@/lib/auth/types";

const user: MeResponse["user"] = {
  id: "user_1",
  email: "demo@rentmate.local",
  fullName: "Demo Owner",
  status: "ACTIVE",
  organizationId: "org_1",
};

function authValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    user,
    organization: null,
    roles: [],
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

function renderGate(props: { permission?: string; anyOf?: string[]; allOf?: string[] }, value: AuthContextValue) {
  return render(
    <AuthProvider value={value}>
      <PermissionGate {...props} fallback={<p>Hidden</p>}>
        <p>Visible</p>
      </PermissionGate>
    </AuthProvider>,
  );
}

describe("PermissionGate", () => {
  it("renders children when the permission is present", () => {
    renderGate({ permission: "invoice:generate" }, authValue({ permissions: ["invoice:generate"] }));
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("renders the fallback when the permission is missing", () => {
    renderGate({ permission: "invoice:generate" }, authValue({ permissions: ["property:read"] }));
    expect(screen.getByText("Hidden")).toBeInTheDocument();
    expect(screen.queryByText("Visible")).not.toBeInTheDocument();
  });

  it("renders nothing while auth is loading", () => {
    const { container } = renderGate(
      { permission: "invoice:generate" },
      authValue({ permissions: ["invoice:generate"], isLoading: true }),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("supports anyOf and allOf lists", () => {
    renderGate({ anyOf: ["user:update", "user:read"] }, authValue({ permissions: ["user:read"] }));
    expect(screen.getByText("Visible")).toBeInTheDocument();

    renderGate({ allOf: ["user:read", "user:update"] }, authValue({ permissions: ["user:read"] }));
    expect(screen.getAllByText("Hidden")).toHaveLength(1);
  });
});
