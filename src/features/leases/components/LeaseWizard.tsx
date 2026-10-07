'use client';
import { messageKey } from '../../../lib/i18n/message-key';
import { useTranslations } from 'next-intl';
import { UnitsGrid } from '../../units';
import { Button } from '../../../components/ui/Button';
import { AuthErrorNotice } from '../../auth';
import { useLeaseWizard } from '../hooks/use-lease-wizard';
import { LeaseFields } from './LeaseFields';
import type { Lease } from '../api/leases-api';
export function LeaseWizard({
  property,
  done,
  renew,
}: {
  property: string;
  done: () => void;
  renew?: Lease | undefined;
}): React.JSX.Element {
  const t = useTranslations(),
    state = useLeaseWizard(property, done, renew);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        state.save();
      }}
    >
      <LeaseTarget state={state} locked={!!renew} />
      <LeaseFields value={state.value} set={state.set} />
      <LeaseValidation state={state} />
      <Button
        type="submit"
        disabled={state.submission.busy || (!renew && state.available !== true)}
      >
        {t(renew ? 'rental.renew' : 'rental.createLease')}
      </Button>
    </form>
  );
}
function LeaseTarget({
  state,
  locked,
}: {
  state: ReturnType<typeof useLeaseWizard>;
  locked: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <section className="space-y-3">
      <label>
        {t('rental.chooseTenant')}
        <select
          className="ms-3 rounded border bg-surface p-2"
          value={state.value.tenantId}
          disabled={locked}
          onChange={(e) => {
            state.set({ ...state.value, tenantId: e.target.value });
          }}
        >
          <option value="">{t('rental.chooseTenant')}</option>
          {state.tenants.map((row) => (
            <option key={row.id} value={row.id}>
              {row.fullName}
            </option>
          ))}
        </select>
      </label>
      {!locked ? (
        <>
          <h2 className="font-semibold">{t('rental.unit')}</h2>
          <UnitsGrid units={state.units} open={state.choose} />
          {state.hasMore ? (
            <Button type="button" onClick={state.more}>
              {t('rental.more')}
            </Button>
          ) : null}
        </>
      ) : null}
      {state.unit ? <p role="status">{t('rental.selected', { code: state.unit.code })}</p> : null}
      <LeaseBedPicker state={state} locked={locked} />
    </section>
  );
}
function LeaseBedPicker({
  state,
  locked,
}: {
  state: ReturnType<typeof useLeaseWizard>;
  locked: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <label>
      {t('rental.bed')}
      <select
        className="ms-3 rounded border bg-surface p-2"
        value={state.value.bedId ?? ''}
        disabled={locked}
        onChange={(e) => {
          state.set({ ...state.value, bedId: e.target.value || null });
        }}
      >
        <option value="">{t('rental.wholeUnit')}</option>
        {state.beds.map((bed) => (
          <option key={bed.id} value={bed.id}>
            {bed.label}
          </option>
        ))}
      </select>
    </label>
  );
}
function LeaseValidation({
  state,
}: {
  state: ReturnType<typeof useLeaseWizard>;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="space-y-3">
      {state.invalid ? <p role="alert">{t('rental.validation')}</p> : null}
      <Button
        type="button"
        variant="outline"
        disabled={state.submission.busy}
        onClick={state.check}
      >
        {t('rental.checkAvailability')}
      </Button>
      {state.available !== null ? (
        <p role={state.available ? 'status' : 'alert'}>
          {t(state.available ? messageKey('rental.available') : messageKey('rental.conflict'))}
        </p>
      ) : null}
      <AuthErrorNotice {...state.submission} />
    </div>
  );
}
