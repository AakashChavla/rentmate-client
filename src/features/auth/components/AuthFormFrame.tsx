'use client';
import type { ReactNode } from 'react';
import { Button } from '../../../components/ui/Button';
import { useAuthSubmission } from '../hooks/use-auth-submission';
import { AuthErrorNotice } from './AuthErrorNotice';
export function AuthFormFrame({
  children,
  title,
  action,
  submission,
  onSubmit,
}: {
  children: ReactNode;
  title: string;
  action: string;
  submission: ReturnType<typeof useAuthSubmission>;
  onSubmit: () => Promise<void>;
}): React.JSX.Element {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <h1 className="text-3xl font-bold">{title}</h1>
      {children}
      <AuthErrorNotice {...submission} />
      <Button className="w-full" disabled={submission.busy || !!submission.remaining}>
        {action}
      </Button>
    </form>
  );
}
