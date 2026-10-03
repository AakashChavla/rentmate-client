'use client';
import { Dialog as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
export const Sheet = Primitive.Root;
export const SheetTrigger = Primitive.Trigger;
export const SheetClose = Primitive.Close;
export const SheetTitle = Primitive.Title;
export const SheetDescription = Primitive.Description;
export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>): React.JSX.Element {
  const t = useTranslations();
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
      <Primitive.Content
        className={cn(
          'sheet-content fixed inset-y-0 start-0 z-50 w-80 max-w-[90vw] border-e border-border bg-card p-6 shadow-xl',
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          aria-label={t('common.close')}
          className="absolute end-4 top-4 rounded-lg p-2"
        >
          <X className="h-4 w-4" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
