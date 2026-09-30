"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getHomeRoute } from "@/lib/auth/home";

export default function UnauthorizedPage() {
  const { roles, isAuthenticated, isLoading } = useAuth();
  const home = isAuthenticated ? getHomeRoute({ roles }) : "/login";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-medium text-muted-foreground">403</p>
      <h1 className="text-2xl font-semibold tracking-tight">You don’t have access to that page</h1>
      <p className="text-sm text-muted-foreground">
        Your account is signed in, but this page needs a permission you don’t have.
      </p>
      <Button asChild disabled={isLoading}>
        <Link href={home}>Go to your home</Link>
      </Button>
    </main>
  );
}
