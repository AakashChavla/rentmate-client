import { apiRequest, type PageInfo } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * OpenAPI types `phone` and `lastLoginAt` as empty records. The running API
 * returns `string | null`. List `data` is an array even though the schema
 * types a single UserViewDto.
 */
export type UserView = Omit<
  components["schemas"]["UserViewDto"],
  "phone" | "lastLoginAt" | "roles"
> & {
  phone: string | null;
  lastLoginAt: string | null;
  roles: UserRole[];
};

export type UserRole = components["schemas"]["UserRoleDto"] & {
  id?: string;
};

export type UpdateUserInput = {
  fullName?: string;
  phone?: string | null;
  status?: components["schemas"]["UpdateUserDto"]["status"];
};

export type RoleAssignment = components["schemas"]["RoleAssignmentDto"];

export type UsersPage = {
  users: UserView[];
  page: PageInfo;
};

export type ListUsersParams = {
  search?: string;
  status?: "INVITED" | "ACTIVE" | "SUSPENDED";
  cursor?: string;
  limit?: number;
};

const assignmentIds = new Map<string, string>();

function assignmentKey(
  userId: string,
  roleKey: string,
  scopeType: string,
  scopeId: string,
): string {
  return `${userId}:${roleKey}:${scopeType}:${scopeId}`;
}

export function rememberAssignment(userId: string, assignment: RoleAssignment): void {
  assignmentIds.set(
    assignmentKey(userId, assignment.roleKey, assignment.scopeType, assignment.scopeId),
    assignment.id,
  );
}

/**
 * GET /users roles omit assignment id. Ids are known only after a successful
 * assign in this session, or if the payload starts including `id`.
 */
export function lookupAssignmentId(userId: string, role: UserRole): string | undefined {
  if (typeof role.id === "string" && role.id.length > 0) return role.id;
  return assignmentIds.get(assignmentKey(userId, role.key, role.scopeType, role.scopeId));
}

function isUserView(value: unknown): value is UserView {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.email === "string" && Array.isArray(record.roles);
}

export async function listUsers(params: ListUsersParams = {}): Promise<UsersPage> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.cursor) query.set("cursor", params.cursor);
  query.set("limit", String(params.limit ?? 20));
  const suffix = query.toString();
  const result = await apiRequest<unknown>(`/users${suffix ? `?${suffix}` : ""}`);
  const users = Array.isArray(result.data) ? result.data.filter(isUserView) : [];
  return {
    users,
    page: result.meta.page ?? { hasNext: false, nextCursor: null },
  };
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<UserView> {
  const result = await apiRequest<UserView>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function assignRole(
  userId: string,
  input: components["schemas"]["AssignRoleDto"],
): Promise<RoleAssignment> {
  const result = await apiRequest<RoleAssignment>(`/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (result.data?.id) rememberAssignment(userId, result.data);
  return result.data;
}

/**
 * Swagger types this as RoleAssignmentDto. The service returns `{ removed: true }`.
 */
export async function removeRole(
  userId: string,
  assignmentId: string,
): Promise<{ removed: boolean }> {
  const result = await apiRequest<{ removed?: boolean }>(
    `/users/${userId}/roles/${assignmentId}`,
    { method: "DELETE" },
  );
  return { removed: result.data?.removed !== false };
}
