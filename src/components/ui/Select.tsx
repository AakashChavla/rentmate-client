'use client';
import { Select as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>): React.JSX.Element {
  return (
    <Primitive.Trigger
      className={cn(
        'flex h-11 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-sm',
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Icon>
        <ChevronDown className="h-4 w-4" />
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}
export function SelectContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>): React.JSX.Element {
  return (
    <Primitive.Portal>
      <Primitive.Content
        position="popper"
        className={cn('z-50 rounded-xl border border-border bg-card p-1 shadow-xl', className)}
        {...props}
      >
        <Primitive.Viewport>{children}</Primitive.Viewport>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Item>): React.JSX.Element {
  return (
    <Primitive.Item
      className={cn(
        'relative cursor-pointer rounded-lg py-2 pe-8 ps-3 text-sm outline-none focus:bg-muted',
        className,
      )}
      {...props}
    >
      <Primitive.ItemText>{children}</Primitive.ItemText>
      <Primitive.ItemIndicator className="absolute end-2">
        <Check className="h-4 w-4" />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  );
}
