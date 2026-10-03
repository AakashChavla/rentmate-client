'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TENANT_NAV } from '../../config/nav';
import { ROUTES } from '../../config/app.constants';
import { ThemeToggle } from '../shared/ThemeToggle';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { PreviewNotice } from './PreviewNotice';
import { cn } from '../../lib/utils';
export function TenantShell({ children }: { children: ReactNode }): React.JSX.Element {
  const t = useTranslations();
  const path = usePathname();
  return (
    <div className="min-h-screen pb-24">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card p-4">
        <Link href={ROUTES.TENANT_DASHBOARD} className="font-display text-xl font-bold">
          {t('common.tenantSpace')}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4 py-8">
        <PreviewNotice />
        {children}
      </main>
      <nav
        aria-label={t('common.tenantSpace')}
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-card/95 px-2 pb-safe pt-2 backdrop-blur"
      >
        {TENANT_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={path === item.href ? 'page' : undefined}
            className={cn(
              'flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium',
              path === item.href ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="h-5 w-5" />
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
