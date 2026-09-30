import { Skeleton } from "@/components/ui/skeleton";

export default function TenantLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
