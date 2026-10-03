'use client';
import { useState, type ReactNode } from 'react';
import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { ShellTopbar } from './ShellTopbar';
import { PreviewNotice } from './PreviewNotice';
export function AdminShell({
  children,
  permissions,
}: {
  children: ReactNode;
  permissions?: ReadonlySet<string>;
}): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const scoped = permissions ? { permissions } : {};
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
        <main className="mx-auto max-w-7xl p-4 py-8 md:p-8">
          <PreviewNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
