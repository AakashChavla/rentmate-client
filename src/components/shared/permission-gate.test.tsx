import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PermissionGate } from "@/components/shared/permission-gate";
import type { AuthState } from "@/lib/auth/types";

function renderGate(permission: string, value: AuthState) {
  return render(
    <AuthProvider value={value}>
      <PermissionGate permission={permission} fallback={<p>Hidden</p>}>
        <p>Visible</p>
      </PermissionGate>
    </AuthProvider>,
  );
}

describe("PermissionGate", () => {
  it("renders children when the permission is present", () => {
    renderGate("invoice:generate", {
      user: null,
      permissions: ["invoice:generate"],
      isLoading: false,
    });

    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("renders the fallback when the permission is missing", () => {
    renderGate("invoice:generate", {
      user: null,
      permissions: ["property:read"],
      isLoading: false,
    });

    expect(screen.getByText("Hidden")).toBeInTheDocument();
    expect(screen.queryByText("Visible")).not.toBeInTheDocument();
  });

  it("renders nothing while auth is loading", () => {
    const { container } = renderGate("invoice:generate", {
      user: null,
      permissions: ["invoice:generate"],
      isLoading: true,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
