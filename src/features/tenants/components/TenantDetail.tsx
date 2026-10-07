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
import {
  RENTAL_KEYS,
  RENTAL_STATE as S,
  RENTAL_PERMISSION as P,
  STATUS_MESSAGES,
} from '../../../config/lease.constants';
import { IDENTITY_ROLE as ROLE } from '../../../config/auth.constants';
import { DocumentPanel } from './DocumentPanel';
export function TenantDetail({ id }: { id: string }): React.JSX.Element {
  return <TenantDetailView {...useTenantDetailModel({ id })} />;
}
function useTenantDetailModel({ id }: { id: string }): TenantDetailModelResult {
  const t = useTranslations(),
    services = useServices(),
    client = useQueryClient(),
    can = usePermissionChecker(),
    auth = useOptionalAuth(),
    submission = useAuthSubmission();
  const tenant = useQuery({
    queryKey: RENTAL_KEYS.tenant(id),
    queryFn: () => services.tenants.get(id),
  });
  const [reason, setReason] = useState(''),
    [invited, setInvited] = useState(false);
  const row = tenant.data;
  const staff =
    !!row &&
    can(P.TENANT_UPDATE, { propertyId: row.propertyId }) &&
    !auth?.roles.some((r) => r.role === ROLE.TENANT);
  const canUpload = staff || !!auth?.roles.some((r) => r.role === ROLE.TENANT);
  const review = (status: typeof S.VERIFIED | typeof S.REJECTED): void => {
    void submission.run(async () => {
      await services.tenants.review(id, status, reason);
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.tenant(id) });
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.tenants });
    });
  };
  return {
    t,
    services,
    submission,
    tenant,
    reason,
    setReason,
    invited,
    setInvited,
    row,
    staff,
    canUpload,
    review,
    id,
  };
}
function TenantDetailView(model: TenantDetailViewProps): React.JSX.Element {
  const { t, tenant, row } = model;

  if (!row)
    return (
      <p role={tenant.isError ? 'alert' : 'status'}>
        {t(tenant.isError ? 'errors.INTERNAL_ERROR' : messageKey('rental.loading'))}
      </p>
    );
  return <TenantInformation {...model} row={row} />;
}

function TenantReviewActions(model: TenantReviewActionsProps): React.JSX.Element {
  const { t, services, submission, reason, setInvited, review, id } = model;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => {
          review(S.VERIFIED);
        }}
        disabled={submission.busy}
      >
        {t('rental.verify')}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          review(S.REJECTED);
        }}
        disabled={!reason.trim() || submission.busy}
      >
        {t('rental.reject')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={submission.busy}
        onClick={() => {
          void submission.run(async () => {
            await services.tenants.invite(id);
            setInvited(true);
          });
        }}
      >
        {t('rental.invite')}
      </Button>
    </div>
  );
}

function TenantInformation(model: TenantInformationProps): React.JSX.Element {
  const { t, submission, invited, row, staff, canUpload, id } = model;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-semibold">{row.fullName}</h2>
      <p>{t(STATUS_MESSAGES[row.status])}</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt>{t('rental.phone')}</dt>
          <dd>{row.phone}</dd>
        </div>
        <div>
          <dt>{t('rental.email')}</dt>
          <dd>{row.email}</dd>
        </div>
        <div>
          <dt>{t('rental.maskedId')}</dt>
          <dd>{row.maskedId ?? '—'}</dd>
        </div>
        <div>
          <dt>{t('rental.emergency')}</dt>
          <dd>{row.emergencyContact ?? '—'}</dd>
        </div>
      </dl>
      <DocumentPanel tenant={id} staff={staff} canUpload={canUpload} />
      {staff ? <TenantReviewSection {...model} /> : null}
      {invited ? <p role="status">{t('rental.invited')}</p> : null}
      <AuthErrorNotice {...submission} />
    </section>
  );
}

function TenantReviewSection(model: TenantReviewSectionProps): React.JSX.Element {
  const { t, reason, setReason } = model;

  return (
    <>
      <p>{t('rental.reviewHelp')}</p>
      <InputField
        label={t('rental.reason')}
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
        }}
      />
      <TenantReviewActions {...model} />
    </>
  );
}

type TenantDetailModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  submission: ReturnType<typeof useAuthSubmission>;
  tenant: { data: import('../api/tenants-api').Tenant | undefined; isError: boolean };
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  invited: boolean;
  setInvited: React.Dispatch<React.SetStateAction<boolean>>;
  row: import('../api/tenants-api').Tenant | undefined;
  staff: boolean;
  canUpload: boolean;
  review: (status: typeof S.VERIFIED | typeof S.REJECTED) => void;
  id: string;
};

type TenantDetailViewProps = ReturnType<typeof useTenantDetailModel>;

type TenantReviewActionsProps = Pick<
  ReturnType<typeof useTenantDetailModel> & {
    row: NonNullable<ReturnType<typeof useTenantDetailModel>['row']>;
  },
  't' | 'services' | 'submission' | 'reason' | 'setInvited' | 'review' | 'id'
>;

type TenantInformationProps = Pick<
  ReturnType<typeof useTenantDetailModel> & {
    row: NonNullable<ReturnType<typeof useTenantDetailModel>['row']>;
  },
  | 't'
  | 'services'
  | 'submission'
  | 'tenant'
  | 'reason'
  | 'setReason'
  | 'invited'
  | 'setInvited'
  | 'row'
  | 'staff'
  | 'canUpload'
  | 'review'
  | 'id'
>;

type TenantReviewSectionProps = Pick<
  ReturnType<typeof useTenantDetailModel> & {
    row: NonNullable<ReturnType<typeof useTenantDetailModel>['row']>;
  },
  't' | 'services' | 'submission' | 'reason' | 'setReason' | 'setInvited' | 'review' | 'id'
>;
