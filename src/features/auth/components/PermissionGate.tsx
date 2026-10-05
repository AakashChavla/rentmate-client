'use client';
import type { ReactNode } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { can } from '../../../lib/auth-policy';
export function PermissionGate({
  children,
  anyOf = [],
  allOf = [],
  fallback = null,
}: {
  children: ReactNode;
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
}): React.JSX.Element {
  const { me } = useAuth();
  const allowed =
    !!me && (!anyOf.length || anyOf.some((p) => can(me, p))) && allOf.every((p) => can(me, p));
  return <>{allowed ? children : fallback}</>;
}
