import type { Metadata } from "next";
import { HealthStatus } from "@/components/shared/health-status";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A snapshot of occupancy, collections, and open work will live here."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API connection</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthStatus />
        </CardContent>
      </Card>
      <EmptyState
        title="Coming soon"
        description="This section will be available in a later phase."
      />
    </div>
  );
}
