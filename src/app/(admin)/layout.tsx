import { AuthGuard, RoutePermissionGuard } from '../../features/auth';
import type { ReactNode } from 'react';
import { AdminShell } from '../../components/shells/AdminShell';
export default function Layout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <AuthGuard>
      <RoutePermissionGuard>
        <AdminShell>{children}</AdminShell>
      </RoutePermissionGuard>
    </AuthGuard>
  );
}
