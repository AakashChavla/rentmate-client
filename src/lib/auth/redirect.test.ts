import { describe, expect, it } from "vitest";
import { loginHref, sanitizeNext } from "@/lib/auth/redirect";
import { getHomeRoute } from "@/lib/auth/home";

describe("sanitizeNext", () => {
  it("keeps same-origin relative paths", () => {
    expect(sanitizeNext("/admin/settings/users")).toBe("/admin/settings/users");
    expect(sanitizeNext("/tenant/dashboard?tab=lease")).toBe("/tenant/dashboard?tab=lease");
    expect(loginHref("/admin/dashboard")).toBe("/login?next=%2Fadmin%2Fdashboard");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(sanitizeNext("https://evil.com")).toBeNull();
    expect(sanitizeNext("http://evil.com/admin")).toBeNull();
    expect(sanitizeNext("//evil.com")).toBeNull();
    expect(sanitizeNext("/\\evil.com")).toBeNull();
    expect(sanitizeNext("https://rentmate.com/admin")).toBeNull();
    expect(loginHref("https://evil.com")).toBe("/login");
  });
});

describe("getHomeRoute", () => {
  it("sends tenant-only users to the tenant dashboard", () => {
    expect(getHomeRoute({ roles: [{ key: "TENANT" }] })).toBe("/tenant/dashboard");
  });

  it("sends every other role to the admin dashboard", () => {
    expect(getHomeRoute({ roles: [{ key: "ORG_OWNER" }] })).toBe("/admin/dashboard");
    expect(getHomeRoute({ roles: [{ key: "TENANT" }, { key: "ORG_OWNER" }] })).toBe(
      "/admin/dashboard",
    );
    expect(getHomeRoute({ roles: [] })).toBe("/admin/dashboard");
  });
});
