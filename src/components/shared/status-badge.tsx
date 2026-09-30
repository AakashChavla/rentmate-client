import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  active: "default",
  invited: "secondary",
  suspended: "destructive",
  paid: "default",
  open: "secondary",
  pending: "outline",
  overdue: "destructive",
  closed: "secondary",
  failed: "destructive",
  cancelled: "destructive",
};

function labelFor(status: string): string {
  return status.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status.toLowerCase()] ?? "outline";
  return (
    <Badge variant={variant} className={className}>
      {labelFor(status)}
    </Badge>
  );
}
