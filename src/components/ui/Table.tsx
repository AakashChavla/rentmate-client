import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';
export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>): React.JSX.Element {
  return <table className={cn('w-full text-sm', className)} {...props} />;
}
export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <thead className={cn('border-b border-border', className)} {...props} />;
}
export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}
export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>): React.JSX.Element {
  return <tr className={cn('border-b border-border hover:bg-muted/50', className)} {...props} />;
}
export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return (
    <th
      className={cn('px-4 py-3 text-start font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}
export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return <td className={cn('px-4 py-3', className)} {...props} />;
}
export function TableCaption({
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>): React.JSX.Element {
  return <caption className={cn('mt-3 text-sm text-muted-foreground', className)} {...props} />;
}
