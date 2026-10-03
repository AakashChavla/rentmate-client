'use client';
import { Tabs as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';
export const Tabs = Primitive.Root;
export const TabsContent = Primitive.Content;
export function TabsList({
  className,
  ...props
}: ComponentProps<typeof Primitive.List>): React.JSX.Element {
  return (
    <Primitive.List
      className={cn('inline-flex gap-1 rounded-xl bg-muted p-1', className)}
      {...props}
    />
  );
}
export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof Primitive.Trigger>): React.JSX.Element {
  return (
    <Primitive.Trigger
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
