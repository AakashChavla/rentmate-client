import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '../../config/app.constants';
import { Entrance } from '../shared/Entrance';
import { AuthBrandPanel } from '../shared/AuthBrandPanel';
import { ThemeToggle } from '../shared/ThemeToggle';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
export async function AuthLayout({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col">
        <Link href={ROUTES.HOME} className="font-display text-2xl font-bold">
          {t('common.brand')}
        </Link>
        <Entrance>
          <AuthBrandPanel />
        </Entrance>
        <p className="mt-auto text-sm text-white/80">{t('common.authNote')}</p>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-end gap-3 p-6">
          <LanguageSwitcher />
          <ThemeToggle />
        </header>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
