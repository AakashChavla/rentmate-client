import { useTranslations } from 'next-intl';
import { FEATURES } from '../../../config/landing.constants';
import { StaggeredList } from '../../../components/shared/StaggeredList';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
export function LandingFeatures(): React.JSX.Element {
  const t = useTranslations();
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <div className="mb-12 max-w-xl">
        <p className="mb-4 text-sm font-semibold text-primary">{t('common.featuresEyebrow')}</p>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t('common.featuresTitle')}
        </h2>
      </div>
      <StaggeredList className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="h-full transition-colors hover:border-primary/30">
            <CardHeader>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">{t(feature.title)}</CardTitle>
              <CardDescription className="!mt-3 leading-relaxed">{t(feature.body)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </StaggeredList>
    </section>
  );
}
