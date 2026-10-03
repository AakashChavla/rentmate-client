'use client';
import { Avatar as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';
export function Avatar({
  className,
  ...props
}: ComponentProps<typeof Primitive.Root>): React.JSX.Element {
  return (
    <Primitive.Root
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}
export const AvatarImage = Primitive.Image;
export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof Primitive.Fallback>): React.JSX.Element {
  return (
    <Primitive.Fallback
      className={cn(
        'flex h-full w-full items-center justify-center bg-primary/10 text-sm font-medium text-primary',
        className,
      )}
      {...props}
    />
  );
}
