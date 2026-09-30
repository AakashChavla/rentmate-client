"use client";

import { useQuery } from "@tanstack/react-query";
import { listRoles } from "@/lib/api/resources/roles";
import { canAccess } from "@/lib/auth/permissions";
import { useAuth } from "@/hooks/use-auth";

export function useHasPermission(permission: string): boolean {
  const { permissions, isLoading } = useAuth();
  if (isLoading) return false;
  return permissions.includes(permission);
}

export function useCan(permission: string, options?: { propertyId?: string }): boolean {
  const { permissions, roles, isLoading, isAuthenticated } = useAuth();
  const propertyId = options?.propertyId;
  const catalog = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
    enabled: isAuthenticated && Boolean(propertyId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) return false;
  return canAccess({
    permission,
    permissions,
    roles,
    catalog: catalog.data ?? [],
    propertyId,
  });
}
