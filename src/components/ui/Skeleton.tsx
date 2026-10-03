import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div aria-hidden className={cn('skeleton rounded-xl bg-muted', className)} {...props} />;
}
