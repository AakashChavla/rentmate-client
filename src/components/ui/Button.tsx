import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border border-slate-300 bg-transparent text-foreground hover:bg-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, asChild = false, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ variant, className }))} ref={ref} {...props} />;
});
