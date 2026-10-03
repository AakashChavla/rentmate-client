import type { ReactNode } from 'react';
import { EmptyIllustration } from './EmptyIllustration';
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}): React.JSX.Element {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <EmptyIllustration />
      <h2 className="mt-5 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
