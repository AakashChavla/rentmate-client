import type { ReactNode } from 'react';
import { AuthLayout } from '../../components/shells/AuthLayout';
export default function Layout({ children }: { children: ReactNode }): React.JSX.Element {
  return <AuthLayout>{children}</AuthLayout>;
}
