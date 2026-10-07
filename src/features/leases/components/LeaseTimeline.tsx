'use client';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { CheckCircle, Clock } from 'lucide-react';
import { LEASE_STATES, STATUS_MESSAGES } from '../../../config/lease.constants';
import { MOTION } from '../../../config/motion';
import type { Lease } from '../api/leases-api';
export function LeaseTimeline({ lease }: { lease: Pick<Lease, 'status'> }): React.JSX.Element {
  const t = useTranslations();
  return (
    <ol aria-label={t('rental.timeline')} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {LEASE_STATES.map((status) => {
        const current = status === lease.status;
        const Icon = current ? CheckCircle : Clock;
        return (
          <m.li
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: MOTION.DURATION.SHORT }}
            aria-current={current ? 'step' : undefined}
            className="flex items-center gap-2 rounded-xl border p-3"
          >
            <Icon
              aria-hidden="true"
              className={current ? 'text-primary' : 'text-muted-foreground'}
            />
            <span className={current ? 'font-semibold' : ''}>{t(STATUS_MESSAGES[status])}</span>
          </m.li>
        );
      })}
    </ol>
  );
}
