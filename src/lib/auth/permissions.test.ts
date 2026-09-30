import { describe, expect, it } from "vitest";
import { canAccess, type RoleCatalogItem } from "@/lib/auth/permissions";

const catalog: RoleCatalogItem[] = [
  { key: "ORG_OWNER", name: "Owner", permissions: ["user:read", "role:assign"] },
  { key: "PROPERTY_MANAGER", name: "Manager", permissions: ["complaint:read"] },
];

describe("canAccess", () => {
  it("treats an organization grant as valid for every property", () => {
    expect(
      canAccess({
        permission: "user:read",
        permissions: ["user:read"],
        roles: [{ key: "ORG_OWNER", scopeType: "ORGANIZATION", scopeId: "org-1" }],
        catalog,
        propertyId: "property-9",
      }),
    ).toBe(true);
  });

  it("limits a property grant to that property", () => {
    const roles = [{ key: "PROPERTY_MANAGER", scopeType: "PROPERTY", scopeId: "property-1" }];
    expect(
      canAccess({
        permission: "complaint:read",
        permissions: ["complaint:read"],
        roles,
        catalog,
        propertyId: "property-1",
      }),
    ).toBe(true);
    expect(
      canAccess({
        permission: "complaint:read",
        permissions: ["complaint:read"],
        roles,
        catalog,
        propertyId: "property-2",
      }),
    ).toBe(false);
  });

  it("allows an org-wide check from the flat permission list", () => {
    expect(
      canAccess({
        permission: "user:read",
        permissions: ["user:read"],
        roles: [],
        catalog: [],
      }),
    ).toBe(true);
    expect(
      canAccess({
        permission: "user:update",
        permissions: ["user:read"],
        roles: [],
        catalog,
      }),
    ).toBe(false);
  });
});
