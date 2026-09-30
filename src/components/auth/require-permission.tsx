"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

type RequirePermissionProps = {
  permission: string;
  children: ReactNode;
};

/** Page-level UX gate. The API still rejects the request if the permission is missing. */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { permissions, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const allowed = permissions.includes(permission);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!allowed) router.replace("/unauthorized");
  }, [allowed, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!allowed) return null;
  return children;
}
