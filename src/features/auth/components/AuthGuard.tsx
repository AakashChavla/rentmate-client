'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../providers/AuthProvider';
import { sanitizeNext } from '../../../lib/auth-policy';
import { ROUTES } from '../../../config/app.constants';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useHasPermission } from '../hooks/use-permission';
export function AuthGuard({ children }: { children: ReactNode }): React.JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(sanitizeNext(pathname))}`);
  }, [isLoading, isAuthenticated, router, pathname]);
  if (isLoading || !isAuthenticated)
    return (
      <div role="status" aria-label={t('auth.checkingSession')}>
        <Skeleton className="mx-auto mt-16 h-32 max-w-xl" />
      </div>
    );
  return <>{children}</>;
}
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}): React.JSX.Element {
  const allowed = useHasPermission(permission);
  const { isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !allowed) router.replace(ROUTES.FORBIDDEN);
  }, [isLoading, allowed, router]);
  return <>{allowed ? children : null}</>;
}
