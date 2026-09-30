"use client";

import { useQuery } from "@tanstack/react-query";
import { env } from "@/env";
import { apiClient } from "@/lib/api/client";

export type HealthReadyResponse = {
  status?: string;
};

function healthReadyUrl(): string {
  return `${env.NEXT_PUBLIC_API_ORIGIN.replace(/\/$/, "")}/health/ready`;
}

export function useHealth() {
  return useQuery({
    queryKey: ["health", "ready"],
    queryFn: () => apiClient<HealthReadyResponse>(healthReadyUrl()),
  });
}
