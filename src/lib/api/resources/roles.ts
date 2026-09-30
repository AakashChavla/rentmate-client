import { apiClient } from "@/lib/api/client";
import type { RoleCatalogItem } from "@/lib/auth/permissions";

/**
 * RoleListItemDto is an empty record in the generated schema (the Nest class
 * has no @ApiProperty). The live payload is an array of system roles.
 */
function isRole(value: unknown): value is RoleCatalogItem {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.key === "string" &&
    typeof record.name === "string" &&
    Array.isArray(record.permissions) &&
    record.permissions.every((permission) => typeof permission === "string")
  );
}

export async function listRoles(): Promise<RoleCatalogItem[]> {
  const data = await apiClient<unknown>("/roles");
  if (!Array.isArray(data)) return [];
  return data.filter(isRole);
}
