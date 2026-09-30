"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type PermissionGateProps = {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * UX only. Hiding a link or button is not authorization.
 * The API enforces every permission on the server.
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { permissions, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!permission && !anyOf && !allOf) {
    return fallback;
  }

  const single = permission ? permissions.includes(permission) : true;
  const any = anyOf ? anyOf.some((item) => permissions.includes(item)) : true;
  const all = allOf ? allOf.every((item) => permissions.includes(item)) : true;

  if (!single || !any || !all) {
    return fallback;
  }

  return children;
}
