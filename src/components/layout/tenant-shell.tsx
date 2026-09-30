"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { env } from "@/env";
import { isNavActive, visibleTenantNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuth } from "@/hooks/use-auth";

export function TenantShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { permissions } = useAuth();
  const nav = visibleTenantNav(permissions);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
          <Link
            href="/tenant/dashboard"
            className="text-lg font-semibold tracking-tight text-primary outline-none ring-ring focus-visible:ring-2"
          >
            {env.NEXT_PUBLIC_APP_NAME}
          </Link>
          <nav aria-label="Tenant" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium outline-none ring-ring focus-visible:ring-2",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <nav
        aria-label="Tenant mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background md:hidden"
      >
        <ul className="flex">
          {nav.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium outline-none ring-ring focus-visible:ring-2",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
