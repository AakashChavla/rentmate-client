'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
import { m, useReducedMotion } from 'motion/react';
import { ShellNavigation } from './ShellNavigation';
import { Button } from '../ui/Button';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '../ui/Sheet';
import { ROUTES } from '../../config/app.constants';
import { MOTION } from '../../config/motion';
export interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  permissions?: ReadonlySet<string>;
}
export function DesktopSidebar({
  collapsed,
  onCollapse,
  permissions,
}: SidebarProps): React.JSX.Element {
  const t = useTranslations();
  const reduced = useReducedMotion();
  return (
    <aside
      className={
        collapsed
          ? 'hidden w-20 shrink-0 border-e border-border bg-card p-3 lg:block'
          : 'hidden w-64 shrink-0 border-e border-border bg-card p-4 lg:block'
      }
    >
      <Link href={ROUTES.HOME} className="mb-8 flex h-12 items-center gap-3 px-2">
        <Building2 className="h-7 w-7 shrink-0 text-primary" />
        {!collapsed ? (
          <span className="font-display text-xl font-bold">{t('common.brand')}</span>
        ) : null}
      </Link>
      <m.div
        key={String(collapsed)}
        initial={reduced ? false : { opacity: 0, x: -MOTION.FLOAT_OFFSET }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: MOTION.DURATION.SHORT }}
      >
        <ShellNavigation collapsed={collapsed} {...(permissions ? { permissions } : {})} />
      </m.div>
      <Button
        variant="ghost"
        size="icon"
        className="mt-8"
        onClick={onCollapse}
        aria-label={collapsed ? t('common.expand') : t('common.collapse')}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>
    </aside>
  );
}
export function MobileSidebar({
  permissions,
}: {
  permissions?: ReadonlySet<string>;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label={t('common.menu')}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="mb-6 font-display text-xl font-bold">{t('common.brand')}</SheetTitle>
        <SheetDescription className="sr-only">{t('common.workspace')}</SheetDescription>
        <ShellNavigation {...(permissions ? { permissions } : {})} />
      </SheetContent>
    </Sheet>
  );
}
