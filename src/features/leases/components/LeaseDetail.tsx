'use client';
import { messageKey } from '../../../lib/i18n/message-key';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { usePermissionChecker, useAuthSubmission, AuthErrorNotice } from '../../auth';
import { useOptionalAuth } from '../../../providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import { IDENTITY_ROLE } from '../../../config/auth.constants';
import {
  RENTAL_KEYS,
  RENTAL_PERMISSION as P,
  RENTAL_STATE as S,
} from '../../../config/lease.constants';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { LeaseTimeline } from './LeaseTimeline';
import { LeaseWizard } from './LeaseWizard';
import type { Lease } from '../api/leases-api';
export function LeaseDetail({
  id,
  readOnly = false,
}: {
  id: string;
  readOnly?: boolean;
}): React.JSX.Element {
  const t = useTranslations(),
    services = useServices(),
    can = usePermissionChecker(),
    auth = useOptionalAuth();
  const query = useQuery({
    queryKey: RENTAL_KEYS.lease(id),
    queryFn: () => services.leases.get(id),
  });
  if (!query.data)
    return (
      <p role={query.isError ? 'alert' : 'status'}>
        {t(query.isError ? 'errors.INTERNAL_ERROR' : messageKey('rental.loading'))}
      </p>
    );
  const lease = query.data;
  const staff =
    !readOnly &&
    !auth?.roles.some((r) => r.role === IDENTITY_ROLE.TENANT) &&
    can(P.LEASE_UPDATE, { propertyId: lease.propertyId });
  return (
    <section className="space-y-5">
      <LeaseTimeline lease={lease} />
      <LeaseValues lease={lease} />
      {staff ? <LeaseActions lease={lease} /> : <p>{t('rental.readOnly')}</p>}
    </section>
  );
}
function LeaseValues({ lease }: { lease: Lease }): React.JSX.Element {
  const t = useTranslations();
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div>
        <dt>{t('rental.startDate')}</dt>
        <dd>{lease.startDate}</dd>
      </div>
      <div>
        <dt>{t('rental.endDate')}</dt>
        <dd>{lease.endDate}</dd>
      </div>
      <div>
        <dt>{t('rental.rent')}</dt>
        <dd>{lease.rent}</dd>
      </div>
      <div>
        <dt>{t('rental.deposit')}</dt>
        <dd>{lease.deposit}</dd>
      </div>
      <div>
        <dt>{t('rental.dueDay')}</dt>
        <dd>{lease.dueDay}</dd>
      </div>
      <div>
        <dt>{t('rental.members')}</dt>
        <dd>{lease.members.join(', ') || '—'}</dd>
      </div>
    </dl>
  );
}
function LeaseActions({ lease }: { lease: Lease }): React.JSX.Element {
  return <LeaseActionsView {...useLeaseActionsModel({ lease })} />;
}
function useLeaseActionsModel({ lease }: { lease: Lease }): LeaseActionsModelResult {
  const t = useTranslations(),
    services = useServices(),
    client = useQueryClient(),
    submission = useAuthSubmission();
  const [reference, setReference] = useState(''),
    [reason, setReason] = useState(''),
    [renewing, setRenewing] = useState(false),
    [confirm, setConfirm] = useState(false);
  const refresh = async (): Promise<void> => {
    await client.invalidateQueries({ queryKey: RENTAL_KEYS.lease(lease.id) });
    await client.invalidateQueries({ queryKey: RENTAL_KEYS.leases });
  };
  const terminate = (): void => {
    void submission.run(async () => {
      await services.leases.terminate(lease.id, reason);
      setConfirm(false);
      await refresh();
    });
  };
  return {
    t,
    services,
    submission,
    reference,
    setReference,
    reason,
    setReason,
    renewing,
    setRenewing,
    confirm,
    setConfirm,
    refresh,
    terminate,
    lease,
  };
}
function LeaseActionsView(model: LeaseActionsViewProps): React.JSX.Element {
  const { t, submission, renewing, setRenewing, confirm, setConfirm, refresh, terminate, lease } =
    model;

  return (
    <div className="space-y-4">
      {lease.status === S.PENDING ? <DepositForm {...model} /> : null}
      {lease.status === S.ACTIVE || lease.status === S.EXPIRING ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setRenewing(true);
          }}
        >
          {t('rental.renew')}
        </Button>
      ) : null}
      {renewing ? (
        <LeaseWizard
          property={lease.propertyId}
          renew={lease}
          done={() => {
            setRenewing(false);
            void refresh();
          }}
        />
      ) : null}
      {lease.status !== S.EXPIRED && lease.status !== S.TERMINATED ? (
        <TerminationForm {...model} />
      ) : null}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={t('rental.terminate')}
        description={t('rental.terminateConfirm')}
        onConfirm={terminate}
        pending={submission.busy}
      />
      <AuthErrorNotice {...submission} />
    </div>
  );
}

function DepositForm(model: DepositFormProps): React.JSX.Element {
  const { t, services, submission, reference, setReference, refresh, lease } = model;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submission.run(async () => {
          await services.leases.deposit(lease.id, reference);
          await refresh();
        });
      }}
      className="space-y-3"
    >
      <InputField
        label={t('rental.reference')}
        value={reference}
        onChange={(e) => {
          setReference(e.target.value);
        }}
        required
      />
      <Button disabled={submission.busy}>{t('rental.recordDeposit')}</Button>
    </form>
  );
}

function TerminationForm(model: TerminationFormProps): React.JSX.Element {
  const { t, reason, setReason, setConfirm } = model;

  return (
    <>
      <InputField
        label={t('rental.reason')}
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={!reason.trim()}
        onClick={() => {
          setConfirm(true);
        }}
      >
        {t('rental.terminate')}
      </Button>
    </>
  );
}

type LeaseActionsModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  submission: ReturnType<typeof useAuthSubmission>;
  reference: string;
  setReference: React.Dispatch<React.SetStateAction<string>>;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  renewing: boolean;
  setRenewing: React.Dispatch<React.SetStateAction<boolean>>;
  confirm: boolean;
  setConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => Promise<void>;
  terminate: () => void;
  lease: Lease;
};

type LeaseActionsViewProps = ReturnType<typeof useLeaseActionsModel>;

type DepositFormProps = Pick<
  ReturnType<typeof useLeaseActionsModel>,
  't' | 'services' | 'submission' | 'reference' | 'setReference' | 'refresh' | 'lease'
>;

type TerminationFormProps = Pick<
  ReturnType<typeof useLeaseActionsModel>,
  't' | 'reason' | 'setReason' | 'setConfirm'
>;
