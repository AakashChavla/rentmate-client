"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getHomeRoute, portalFor } from "@/lib/auth/home";
import { loginHref } from "@/lib/auth/redirect";

type AuthGuardProps = {
  allow: "admin" | "tenant";
  children: ReactNode;
};

export function AuthGuard({ allow, children }: AuthGuardProps) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const portal = portalFor({ roles: auth.roles });

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace(loginHref(pathname));
      return;
    }
    if (portal !== allow) {
      router.replace(getHomeRoute({ roles: auth.roles }));
    }
  }, [allow, auth.isAuthenticated, auth.isLoading, auth.roles, pathname, portal, router]);

  if (auth.isLoading || !auth.isAuthenticated || portal !== allow) {
    return (
      <div className="space-y-4 p-6" aria-busy="true" aria-live="polite">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return children;
}
