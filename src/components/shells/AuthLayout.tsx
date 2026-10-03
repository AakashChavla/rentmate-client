import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '../../config/app.constants';
import { Entrance } from '../shared/Entrance';
import { EmptyIllustration } from '../shared/EmptyIllustration';
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
          <div className="my-24 max-w-md">
            <div className="rounded-3xl bg-white/80 p-6">
              <EmptyIllustration />
            </div>
            <h2 className="mt-10 font-display text-4xl font-bold leading-tight">
              {t('common.authTitle')}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/85">
              {t('common.authDescription')}
            </p>
          </div>
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
