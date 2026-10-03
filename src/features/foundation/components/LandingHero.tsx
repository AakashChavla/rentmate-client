import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Entrance } from '../../../components/shared/Entrance';
import { ROUTES } from '../../../config/app.constants';
import { DashboardPreview } from './DashboardPreview';
export function LandingHero(): React.JSX.Element {
  const t = useTranslations();
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-8 md:px-8 md:pb-28 md:pt-14">
      <div className="mesh absolute inset-0 -z-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Entrance>
          <div className="max-w-xl">
            <Badge className="mb-6 gap-2 border border-primary/15 bg-card text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" />
              {t('common.eyebrow')}
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl xl:text-6xl">
              {t('common.heroTitle')}
              <span className="mt-2 block text-gradient">{t('common.heroAccent')}</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('common.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild className="gap-3 py-4 shadow-brand">
                <Link href={ROUTES.REGISTER}>
                  {t('common.heroCta')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href={ROUTES.LOGIN}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                {t('common.heroSecondary')}
              </Link>
            </div>
            <p className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-4 w-4 text-success" />
              {t('common.heroProof')}
            </p>
          </div>
        </Entrance>
        <Entrance>
          <section aria-label={t('common.previewLabel')}>
            <DashboardPreview />
          </section>
        </Entrance>
      </div>
    </section>
  );
}
