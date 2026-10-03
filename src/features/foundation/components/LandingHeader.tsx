import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LanguageSwitcher } from '../../../components/shared/LanguageSwitcher';
import { ThemeToggle } from '../../../components/shared/ThemeToggle';
import { ROUTES } from '../../../config/app.constants';
import { LANDING_ANCHORS } from '../../../config/landing.constants';
import { LandingMobileMenu } from './LandingMobileMenu';
export function LandingHeader(): React.JSX.Element {
  const t = useTranslations();
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 md:px-8">
      <Link href={ROUTES.HOME} className="flex items-center gap-2 font-display text-xl font-bold">
        <span className="rounded-xl bg-brand p-2 text-white">
          <Building2 className="h-5 w-5" />
        </span>
        {t('common.brand')}
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
        <Link href={LANDING_ANCHORS.FEATURES}>{t('common.navFeatures')}</Link>
        <Link href={LANDING_ANCHORS.HOW}>{t('common.navHow')}</Link>
        <Link href={LANDING_ANCHORS.FAQ}>{t('common.navFaq')}</Link>
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>
        <ThemeToggle />
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href={ROUTES.LOGIN}>{t('common.login')}</Link>
        </Button>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href={ROUTES.REGISTER}>{t('common.register')}</Link>
        </Button>
        <LandingMobileMenu />
      </div>
    </header>
  );
}
