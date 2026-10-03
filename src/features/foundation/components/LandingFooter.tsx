import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Building2 } from 'lucide-react';
import { ROUTES } from '../../../config/app.constants';
import { Button } from '../../../components/ui/Button';
export function LandingFooter(): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <section className="mx-5 overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white md:mx-auto md:max-w-7xl md:px-12">
        <h2 className="font-display text-3xl font-bold md:text-4xl">{t('common.ctaTitle')}</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/90">{t('common.ctaBody')}</p>
        <Button
          asChild
          variant="outline"
          className="mt-8 border-white bg-white !text-slate-900 hover:bg-slate-100"
        >
          <Link href={ROUTES.REGISTER}>
            {t('common.register')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-12 text-sm md:flex-row md:px-8">
        <div>
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 font-display text-lg font-bold"
          >
            <Building2 className="h-5 w-5 text-primary" />
            {t('common.brand')}
          </Link>
          <p className="mt-3 text-muted-foreground">{t('common.footerDescription')}</p>
        </div>
        <p className="text-xs text-muted-foreground">{t('common.footerCopyright')}</p>
      </footer>
    </>
  );
}
