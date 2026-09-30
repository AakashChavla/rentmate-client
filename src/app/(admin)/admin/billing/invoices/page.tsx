import type { Metadata } from "next";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Generate and track rent invoices for the selected property."
      />
      <PermissionGate
        permission="invoice:generate"
        fallback={
          <p className="text-sm text-muted-foreground">
            You do not have permission to generate invoices.
          </p>
        }
      >
        <p className="text-sm text-muted-foreground">
          Invoice generation is permitted for this account and will be built in a later
          phase.
        </p>
      </PermissionGate>
      <EmptyState
        title="Coming soon"
        description="This section will be available in a later phase."
      />
    </div>
  );
}
