'use client';
import { m } from 'motion/react';
import { Building2, ShieldCheck, KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MOTION } from '../../config/motion';
export function AuthBrandPanel(): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="relative my-16 grid min-h-64 place-items-center">
      <div className="absolute inset-0 rounded-full bg-secondary/30 blur-3xl" />
      <m.div
        className="relative w-full rounded-3xl border border-white/25 bg-white/15 p-8 shadow-2xl backdrop-blur"
        animate={{ y: [0, -MOTION.FLOAT_OFFSET, 0] }}
        transition={{
          duration: MOTION.DURATION.FLOAT,
          repeat: MOTION.REPEAT,
          ease: MOTION.FLOAT_EASE,
        }}
      >
        <Building2 aria-hidden className="mb-8 size-14" />
        <h2 className="text-3xl font-bold">{t('common.authTitle')}</h2>
        <p className="mt-4 text-white/85">{t('common.authDescription')}</p>
        <div className="mt-8 flex gap-4">
          <ShieldCheck aria-hidden />
          <KeyRound aria-hidden />
        </div>
      </m.div>
      <PropertyCard className="absolute -bottom-8 end-0" />
    </div>
  );
}
function PropertyCard({ className }: { className: string }): React.JSX.Element {
  const t = useTranslations();
  return (
    <m.div
      className={`${className} flex items-center gap-3 rounded-2xl border border-white/30 bg-white/90 p-4 text-slate-900 shadow-xl`}
      animate={{ y: [0, MOTION.FLOAT_OFFSET, 0] }}
      transition={{
        duration: MOTION.DURATION.FLOAT,
        repeat: MOTION.REPEAT,
        ease: MOTION.FLOAT_EASE,
      }}
    >
      <Building2 aria-hidden className="size-8 text-indigo-600" />
      <span className="font-medium">{t('common.properties')}</span>
    </m.div>
  );
}
