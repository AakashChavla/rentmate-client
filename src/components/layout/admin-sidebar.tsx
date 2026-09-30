"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { env } from "@/env";
import { isNavActive, visibleAdminNav, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type AdminSidebarProps = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
};

function NavAnchor({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavLink;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none ring-sidebar-ring focus-visible:ring-2",
        collapsed && "justify-center px-2",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className={cn(collapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
}

export function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  showCollapseToggle = false,
}: AdminSidebarProps) {
  const { permissions } = useAuth();
  const nav = visibleAdminNav(permissions);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="rounded-md outline-none ring-sidebar-ring focus-visible:ring-2"
        >
          <span
            className={cn("text-lg font-semibold tracking-tight", collapsed && "sr-only")}
          >
            {env.NEXT_PUBLIC_APP_NAME}
          </span>
          {collapsed ? (
            <span className="text-lg font-semibold" aria-hidden="true">
              R
            </span>
          ) : null}
        </Link>
        {showCollapseToggle && onToggleCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(collapsed && "hidden")}
            aria-label="Collapse sidebar"
            aria-expanded={!collapsed}
            onClick={onToggleCollapse}
          >
            <PanelLeftClose />
          </Button>
        ) : null}
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-4 overflow-y-auto p-3">
        {nav.map((group) => (
          <div key={group.label} className="space-y-1">
            {group.children ? (
              <p
                className={cn(
                  "px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  collapsed && "sr-only",
                )}
              >
                {group.label}
              </p>
            ) : null}
            {group.href ? (
              <NavAnchor
                item={{ label: group.label, href: group.href, icon: group.icon }}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ) : null}
            {group.children?.map((child) => (
              <NavAnchor
                key={child.href}
                item={child}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>
      {showCollapseToggle && collapsed && onToggleCollapse ? (
        <div className="border-t border-sidebar-border p-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-full"
            aria-label="Expand sidebar"
            aria-expanded={false}
            onClick={onToggleCollapse}
          >
            <PanelLeftOpen />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
