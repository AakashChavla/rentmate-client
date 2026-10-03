'use client';
import { Progress as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
export function Progress({
  value = 0,
  ...props
}: ComponentProps<typeof Primitive.Root>): React.JSX.Element {
  return (
    <Primitive.Root value={value} className="h-2 overflow-hidden rounded-full bg-muted" {...props}>
      <Primitive.Indicator
        className="h-full w-full origin-left bg-primary"
        style={{ transform: `scaleX(${String((value ?? 0) / PERCENT)})` }}
      />
    </Primitive.Root>
  );
}
const PERCENT = 100;
