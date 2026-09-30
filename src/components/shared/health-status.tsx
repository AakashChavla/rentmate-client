"use client";

import { ApiError } from "@/lib/api/client";
import { useHealth } from "@/hooks/use-health";

export function HealthStatus() {
  const health = useHealth();

  if (health.isPending) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Checking API…
      </p>
    );
  }

  if (health.isError) {
    const requestId =
      health.error instanceof ApiError ? health.error.requestId : undefined;
    return (
      <p className="text-sm text-muted-foreground" role="status">
        API is unreachable. Start rentmate-server, then refresh this page.
        {requestId ? ` Request ID: ${requestId}.` : null}
      </p>
    );
  }

  const status = health.data?.status ?? "ready";

  return (
    <p className="text-sm text-muted-foreground" role="status">
      API status: {status}
    </p>
  );
}
