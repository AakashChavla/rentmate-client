export const ADMIN_HOME = "/admin/dashboard";
export const TENANT_HOME = "/tenant/dashboard";

type RoleLike = {
  key: string;
};

/**
 * TENANT-only accounts use the resident portal. Everyone else, including a
 * user with no roles yet, uses the operator portal.
 */
export function getHomeRoute(me: { roles: RoleLike[] } | null | undefined): string {
  const roles = me?.roles ?? [];
  if (roles.length > 0 && roles.every((role) => role.key === "TENANT")) {
    return TENANT_HOME;
  }
  return ADMIN_HOME;
}

export function portalFor(me: { roles: RoleLike[] } | null | undefined): "admin" | "tenant" {
  return getHomeRoute(me) === TENANT_HOME ? "tenant" : "admin";
}
