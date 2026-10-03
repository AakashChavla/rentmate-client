'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { ADMIN_NAV } from '../../config/nav';
import { MOTION } from '../../config/motion';
import { cn } from '../../lib/utils';
export function ShellNavigation({
  collapsed = false,
  permissions,
}: {
  collapsed?: boolean;
  permissions?: ReadonlySet<string>;
}): React.JSX.Element {
  const path = usePathname();
  const t = useTranslations();
  const items = ADMIN_NAV.filter((item) => !permissions || permissions.has(item.permission));
  return (
    <nav className="space-y-1" aria-label={t('common.workspace')}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={collapsed ? t(item.label) : undefined}
          aria-current={path === item.href ? 'page' : undefined}
          className={cn(
            'flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
            path === item.href
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" aria-hidden />
          {!collapsed ? (
            <m.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: MOTION.DURATION.SHORT }}
            >
              {t(item.label)}
            </m.span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
