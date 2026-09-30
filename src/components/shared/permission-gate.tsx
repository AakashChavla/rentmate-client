"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type PermissionGateProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { permissions, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!permissions.includes(permission)) {
    return fallback;
  }

  return children;
}
