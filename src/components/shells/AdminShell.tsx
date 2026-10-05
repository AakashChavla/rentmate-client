'use client';
import { useState, type ReactNode } from 'react';
import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { ShellTopbar } from './ShellTopbar';
import { useOptionalAuth } from '../../providers/AuthProvider';
import { PERMISSION } from '../../config/auth.constants';

export function AdminShell({
  children,
  permissions,
}: {
  children: ReactNode;
  permissions?: ReadonlySet<string>;
}): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const auth = useOptionalAuth();
  const scoped = {
    permissions: permissions ?? new Set([...(auth?.permissions ?? []), PERMISSION.AUTHENTICATED]),
  };
  return (
    <div className="flex min-h-screen">
      <DesktopSidebar
        collapsed={collapsed}
        onCollapse={() => {
          setCollapsed(!collapsed);
        }}
        {...scoped}
      />
      <div className="min-w-0 flex-1">
        <ShellTopbar mobileNavigation={<MobileSidebar {...scoped} />} />
        <main className="mx-auto max-w-7xl p-4 py-8 md:p-8">{children}</main>
      </div>
    </div>
  );
}
