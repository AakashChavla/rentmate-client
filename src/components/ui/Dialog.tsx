'use client';
import { Dialog as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>): React.JSX.Element {
  const t = useTranslations();
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-slate-950/50 dialog-overlay" />
      <Primitive.Content
        className={cn(
          'dialog-content fixed start-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl',
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          className="absolute end-4 top-4 rounded-lg p-1 focus-visible:outline"
          aria-label={t('common.close')}
        >
          <X className="h-4 w-4" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>): React.JSX.Element {
  return (
    <Primitive.Title className={cn('font-display text-xl font-semibold', className)} {...props} />
  );
}
export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>): React.JSX.Element {
  return (
    <Primitive.Description
      className={cn('mt-2 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}
