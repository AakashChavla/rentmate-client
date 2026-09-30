"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/layout/notification-bell";
import { PropertySwitcher } from "@/components/layout/property-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

type AdminTopBarProps = {
  onOpenMobileNav: () => void;
};

export function AdminTopBar({ onOpenMobileNav }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <Menu />
      </Button>
      <PropertySwitcher />
      <div className="ml-auto flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
