'use client';
import { useTranslations } from 'next-intl';
import { InputField } from '../../../components/ui/FormField';
import {
  PROPERTY_TYPES,
  TYPE_KEYS,
  WIZARD_STEP,
  PROPERTY_LIMITS as L,
} from '../../../config/property.constants';
import type { PropertyFields as Fields } from '../schemas/property.schema';
type usePropertyFieldsStateContract = {
  value: Fields;
  onChange: (value: Fields) => void;
  step: number;
  invalid: boolean;
  editing: boolean;
  t: ReturnType<typeof useTranslations<never>>;
  error: string | undefined;
  field: (name: keyof Fields, label: string, maxLength: number) => React.JSX.Element;
};
function usePropertyFieldsState({
  value,
  onChange,
  step,
  invalid,
  editing,
}: {
  value: Fields;
  onChange: (value: Fields) => void;
  step: number;
  invalid: boolean;
  editing: boolean;
}): usePropertyFieldsStateContract {
  const t = useTranslations();
  const error = invalid ? t('property.fieldError') : undefined;
  const field = (name: keyof Fields, label: string, maxLength: number): React.JSX.Element => (
    <InputField
      key={name}
      label={label}
      maxLength={maxLength}
      value={value[name]}
      error={error}
      onChange={(e) => {
        onChange({ ...value, [name]: e.target.value });
      }}
    />
  );
  return { value, onChange, step, invalid, editing, t, error, field };
}
export function PropertyFields({
  value,
  onChange,
  step,
  invalid,
  editing,
}: {
  value: Fields;
  onChange: (value: Fields) => void;
  step: number;
  invalid: boolean;
  editing: boolean;
}): React.JSX.Element {
  const view = usePropertyFieldsState({
    value,
    onChange,
    step,
    invalid,
    editing,
  });
  return <PropertyFieldsView {...view} />;
}
function PropertyFieldsView(view: ReturnType<typeof usePropertyFieldsState>): React.JSX.Element {
  const { value, onChange, step, editing, t, field } = view;
  if (step === WIZARD_STEP.DETAILS)
    return (
      <div className="space-y-4">
        {field('name', t('property.name'), L.NAME)}
        <label className="flex flex-col gap-2">
          <span>{t('property.type')}</span>
          <select
            className="rounded-xl border border-border bg-background p-3"
            value={value.type}
            disabled={editing}
            onChange={(e) => {
              const type = PROPERTY_TYPES.find((type) => type === e.target.value);
              if (type) onChange({ ...value, type });
            }}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(TYPE_KEYS[type])}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {field('addressLine1', t('property.address'), L.ADDRESS)}
      {field('addressLine2', t('property.address2'), L.ADDRESS)}
      {field('city', t('property.city'), L.CITY)}
      {field('state', t('property.state'), L.CITY)}
      {field('postalCode', t('property.postal'), L.POSTAL)}
      {field('country', t('property.country'), L.COUNTRY)}
      {field('timezone', t('property.timezone'), L.TIMEZONE)}
    </div>
  );
}
