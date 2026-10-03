import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LanguageSwitcher } from '../../../components/shared/LanguageSwitcher';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '../../../components/ui/Sheet';
import { ROUTES } from '../../../config/app.constants';
import { LANDING_ANCHORS } from '../../../config/landing.constants';
export function LandingMobileMenu(): React.JSX.Element {
  const t = useTranslations();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label={t('common.menu')}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="font-display text-xl font-bold">{t('common.brand')}</SheetTitle>
        <SheetDescription className="sr-only">{t('common.menu')}</SheetDescription>
        <div className="mt-8 flex flex-col gap-6">
          <LanguageSwitcher />
          <Link href={LANDING_ANCHORS.FEATURES}>{t('common.navFeatures')}</Link>
          <Link href={LANDING_ANCHORS.HOW}>{t('common.navHow')}</Link>
          <Link href={ROUTES.LOGIN}>{t('common.login')}</Link>
          <Button asChild>
            <Link href={ROUTES.REGISTER}>{t('common.register')}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
