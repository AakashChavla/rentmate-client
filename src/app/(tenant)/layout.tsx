import { AuthGuard } from "@/components/auth/auth-guard";
import { TenantShell } from "@/components/layout/tenant-shell";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow="tenant">
      <TenantShell>{children}</TenantShell>
    </AuthGuard>
  );
}
