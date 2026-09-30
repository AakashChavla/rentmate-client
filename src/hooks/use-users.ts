"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { listRoles } from "@/lib/api/resources/roles";
import {
  assignRole,
  listUsers,
  removeRole,
  updateUser,
  type ListUsersParams,
  type UpdateUserInput,
} from "@/lib/api/resources/users";

export const USERS_QUERY_KEY = "users";

export function useUsersList(params: Pick<ListUsersParams, "search" | "status">) {
  return useInfiniteQuery({
    queryKey: [USERS_QUERY_KEY, params],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      listUsers({
        search: params.search,
        status: params.status,
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page.hasNext ? (lastPage.page.nextCursor ?? undefined) : undefined,
  });
}

export function useRoleCatalog(enabled = true) {
  return useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
      updateUser(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      roleKey,
    }: {
      userId: string;
      roleKey: string;
    }) =>
      assignRole(userId, {
        roleKey,
        scopeType: "ORGANIZATION",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, assignmentId }: { userId: string; assignmentId: string }) =>
      removeRole(userId, assignmentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function mutationError(error: unknown): { message: string; requestId?: string } {
  if (error instanceof ApiError) {
    if (error.code === "LAST_OWNER") {
      return {
        message: "This organization needs at least one active owner.",
        requestId: error.requestId,
      };
    }
    if (error.code === "FORBIDDEN") {
      return {
        message: "You don’t have permission to change that.",
        requestId: error.requestId,
      };
    }
    if (error.code === "NOT_SUPPORTED_YET") {
      return {
        message: "Property scope is not available yet.",
        requestId: error.requestId,
      };
    }
    return { message: error.message, requestId: error.requestId };
  }
  return { message: "Something went wrong. Try again." };
}
