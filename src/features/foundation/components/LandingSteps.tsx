import { useTranslations } from 'next-intl';
import { STEPS } from '../../../config/landing.constants';
import { StaggeredList } from '../../../components/shared/StaggeredList';
export function LandingSteps(): React.JSX.Element {
  const t = useTranslations();
  return (
    <section id="how-it-works" className="border-y border-border bg-muted/40 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t('common.howTitle')}</h2>
          <p className="mt-4 text-muted-foreground">{t('common.howSubtitle')}</p>
        </div>
        <StaggeredList className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl bg-card p-7 text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand font-display text-xl font-semibold text-white">
                {String(index + 1)}
              </div>
              <h3 className="font-display text-xl font-semibold">{t(step.title)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(step.body)}</p>
            </div>
          ))}
        </StaggeredList>
      </div>
    </section>
  );
}
