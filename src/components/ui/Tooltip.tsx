'use client';
import { Tooltip as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';
export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
export function TooltipContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>): React.JSX.Element {
  return (
    <Primitive.Portal>
      <Primitive.Content
        className={cn('z-50 rounded-lg bg-foreground px-3 py-2 text-xs text-background', className)}
        {...props}
      />
    </Primitive.Portal>
  );
}
