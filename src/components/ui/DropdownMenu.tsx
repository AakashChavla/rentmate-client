'use client';
import { DropdownMenu as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuLabel = Primitive.Label;
export function DropdownMenuContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>): React.JSX.Element {
  return (
    <Primitive.Portal>
      <Primitive.Content
        className={cn(
          'z-50 min-w-44 rounded-xl border border-border bg-card p-1 shadow-xl',
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof Primitive.Item>): React.JSX.Element {
  return (
    <Primitive.Item
      className={cn(
        'cursor-pointer rounded-lg px-3 py-2 text-sm outline-none focus:bg-muted data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
export const DropdownMenuSeparator = Primitive.Separator;
