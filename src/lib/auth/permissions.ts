export type RoleAssignment = {
  key: string;
  scopeType: string;
  scopeId: string;
};

export type RoleCatalogItem = {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
};

type CanAccessInput = {
  permission: string;
  permissions: string[];
  roles: RoleAssignment[];
  catalog: RoleCatalogItem[];
  propertyId?: string;
};

/**
 * An ORGANIZATION grant applies on every property. A PROPERTY grant applies
 * only to its scopeId. Property scope is prepared for Phase 3; until then the
 * server only issues ORGANIZATION assignments.
 */
export function canAccess({
  permission,
  permissions,
  roles,
  catalog,
  propertyId,
}: CanAccessInput): boolean {
  if (!permissions.includes(permission)) return false;
  if (!propertyId) return true;
  if (catalog.length === 0) return false;

  return roles.some((assignment) => {
    const role = catalog.find((item) => item.key === assignment.key);
    if (!role?.permissions.includes(permission)) return false;
    if (assignment.scopeType === "ORGANIZATION") return true;
    return assignment.scopeType === "PROPERTY" && assignment.scopeId === propertyId;
  });
}
