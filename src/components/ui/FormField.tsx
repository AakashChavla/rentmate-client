'use client';
import { useId, type InputHTMLAttributes } from 'react';
import { Label } from './Label';
import { Input } from './Input';
export function InputField({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}): React.JSX.Element {
  const id = useId();
  const description = `${id}-description`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error || hint ? description : undefined}
        {...props}
      />
      {error || hint ? (
        <p
          id={description}
          className={error ? 'text-sm text-danger' : 'text-sm text-muted-foreground'}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
