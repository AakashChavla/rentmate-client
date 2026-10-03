import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);
