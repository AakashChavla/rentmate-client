'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ROUTE_PERMISSIONS } from '../../../config/route-permissions.constants';
import { RequirePermission } from './AuthGuard';
export function RoutePermissionGuard({ children }: { children: ReactNode }): React.JSX.Element {
  const path = usePathname();
  const permission =
    ROUTE_PERMISSIONS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1] ??
    DENIED_PERMISSION;
  return <RequirePermission permission={permission}>{children}</RequirePermission>;
}
const DENIED_PERMISSION = 'route:unregistered';
