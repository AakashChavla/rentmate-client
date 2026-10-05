import { AuthGuard, RoutePermissionGuard } from '../../features/auth';
import type { ReactNode } from 'react';
import { TenantShell } from '../../components/shells/TenantShell';
export default function Layout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <AuthGuard>
      <RoutePermissionGuard>
        <TenantShell>{children}</TenantShell>
      </RoutePermissionGuard>
    </AuthGuard>
  );
}
