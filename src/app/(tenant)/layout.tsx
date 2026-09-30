import { TenantShell } from "@/components/layout/tenant-shell";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <TenantShell>{children}</TenantShell>;
}
