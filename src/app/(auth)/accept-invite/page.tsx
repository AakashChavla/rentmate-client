import { Suspense } from 'react';
import { AcceptInvite } from '@/features/team';
export default function Page(): React.JSX.Element {
  return (
    <Suspense>
      <AcceptInvite />
    </Suspense>
  );
}
