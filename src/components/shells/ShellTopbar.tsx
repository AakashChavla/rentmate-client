'use client';
import Link from 'next/link';
import { useOptionalAuth } from '../../providers/AuthProvider';
import { getHomeRoute } from '../../lib/auth-policy';
import { HealthStatus } from '../../features/platform';
import { useTranslations } from 'next-intl';
import { Bell, Building2, ChevronDown, UserRound } from 'lucide-react';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { ThemeToggle } from '../shared/ThemeToggle';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { ROUTES } from '../../config/app.constants';
import type { ReactNode } from 'react';
export function ShellTopbar({
  mobileNavigation,
}: {
  mobileNavigation?: ReactNode;
}): React.JSX.Element {
  const view = useShellTopbarState({
    mobileNavigation,
  });
  return <ShellTopbarView {...view} />;
}
type ShellTopbarStateContract = {
  mobileNavigation: ReactNode;
  t: ReturnType<typeof useTranslations<never>>;
  auth: ReturnType<typeof useOptionalAuth>;
};
function useShellTopbarState({
  mobileNavigation,
}: {
  mobileNavigation?: ReactNode;
}): ShellTopbarStateContract {
  const t = useTranslations();
  const auth = useOptionalAuth();
  return { mobileNavigation, t, auth };
}
function UserMenuToolbar(view: ReturnType<typeof useShellTopbarState>): React.JSX.Element {
  const { t, auth } = view;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <HealthStatus />
      <LanguageSwitcher />
      <ThemeToggle />
      <Button variant="ghost" size="icon" disabled aria-label={t('common.notifications')}>
        <Bell className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t('common.profile')}>
            <UserRound className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={
                auth?.me && getHomeRoute(auth.me) === ROUTES.TENANT_DASHBOARD
                  ? ROUTES.TENANT_PROFILE
                  : ROUTES.PROFILE
              }
            >
              {t('common.profile')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              void auth?.logout();
            }}
          >
            {t('common.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShellHeader(view: ReturnType<typeof useShellTopbarState>): React.JSX.Element {
  const { mobileNavigation, t } = view;
  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3">
        {mobileNavigation}
        <Button variant="outline" disabled>
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.allProperties')}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <UserMenuToolbar {...view} />
    </header>
  );
}

function ShellTopbarView(view: ReturnType<typeof useShellTopbarState>): React.JSX.Element {
  return <ShellHeader {...view} />;
}
