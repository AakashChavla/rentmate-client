'use client';
import { useTranslations } from 'next-intl';
import { FORMAT } from '../../../config/app.constants';
import { organizationSchema, type OrganizationFields } from '../schemas/organization.schema';
import { AuthField } from './AuthField';
import { LocaleSelect } from './LocaleSelect';
import { ConsentFields } from './ConsentFields';
import { StepButtons } from './StepButtons';

export function OrganizationStep({
  value,
  onChange,
  onBack,
  onNext,
  busy,
}: {
  value: OrganizationFields;
  onChange: (value: OrganizationFields) => void;
  onBack: () => void;
  onNext: () => void;
  busy: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  const ready = organizationSchema.safeParse(value).success;
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onNext();
      }}
    >
      <AuthField
        field="organizationName"
        required
        value={value.organizationName}
        onChange={(e) => {
          onChange({ ...value, organizationName: e.target.value });
        }}
      />
      <LocaleSelect
        value={value.locale}
        onChange={(locale) => {
          onChange({ ...value, locale });
        }}
      />
      <p className="text-sm text-muted-foreground">
        {t('auth.timezone', { zone: FORMAT.TIMEZONE })}
      </p>
      <ConsentFields value={value} onChange={onChange} />
      <StepButtons busy={busy} ready={ready} onBack={onBack} />
    </form>
  );
}
