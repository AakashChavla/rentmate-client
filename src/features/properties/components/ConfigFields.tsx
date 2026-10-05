'use client';
import { useTranslations } from 'next-intl';
import { InputField } from '../../../components/ui/FormField';
import {
  PROPERTY_TYPE,
  PROPERTY_LIMITS,
  PROPERTY_DEFAULTS,
} from '../../../config/property.constants';
import type { Property, PropertyConfig } from '../api/properties-api';
type useConfigFieldsStateContract = {
  type: 'HOTEL' | 'PG_HOSTEL' | 'APARTMENT_COMPLEX' | 'INDIVIDUAL_FLAT';
  value: import('../../../lib/api/schema').components['schemas']['PropertyConfigDto'];
  onChange: (value: PropertyConfig) => void;
  invalid: boolean;
  t: ReturnType<typeof useTranslations<never>>;
  error: string | undefined;
};
function useConfigFieldsState({
  type,
  value,
  onChange,
  invalid = false,
}: {
  type: Property['type'];
  value: PropertyConfig;
  onChange: (value: PropertyConfig) => void;
  invalid?: boolean;
}): useConfigFieldsStateContract {
  const t = useTranslations();
  const error = invalid ? t('property.configError') : undefined;
  return { type, value, onChange, invalid, t, error };
}
export function ConfigFields({
  type,
  value,
  onChange,
  invalid = false,
}: {
  type: Property['type'];
  value: PropertyConfig;
  onChange: (value: PropertyConfig) => void;
  invalid?: boolean;
}): React.JSX.Element {
  const view = useConfigFieldsState({
    type,
    value,
    onChange,
    invalid,
  });
  return <ConfigFieldsView {...view} />;
}
function ConfigFieldsView(view: ReturnType<typeof useConfigFieldsState>): React.JSX.Element {
  const { type, t } = view;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('property.currency', { currency: PROPERTY_DEFAULTS.CURRENCY })}
      </p>
      {type === PROPERTY_TYPE.HOTEL ? (
        <HotelConfigFields {...view} />
      ) : (
        <RentConfigFields {...view} />
      )}
    </div>
  );
}

function HotelConfigFields(view: Parameters<typeof ConfigFieldsView>[0]): React.JSX.Element {
  const { value, onChange, t, error } = view;
  return (
    <>
      <InputField
        label={t('property.checkIn')}
        type="time"
        value={value.checkInTime ?? ''}
        error={error}
        required
        onChange={(e) => {
          onChange({ ...value, checkInTime: e.target.value });
        }}
      />
      <InputField
        label={t('property.checkOut')}
        type="time"
        value={value.checkOutTime ?? ''}
        error={error}
        required
        onChange={(e) => {
          onChange({ ...value, checkOutTime: e.target.value });
        }}
      />
    </>
  );
}

function RentConfigFields(view: Parameters<typeof ConfigFieldsView>[0]): React.JSX.Element {
  const { value, onChange, t, error } = view;
  return (
    <>
      <InputField
        label={t('property.dueDay')}
        type="number"
        min={1}
        max={PROPERTY_LIMITS.DUE}
        value={value.rentDueDay ?? ''}
        error={error}
        required
        onChange={(e) => {
          onChange({ ...value, rentDueDay: e.target.valueAsNumber });
        }}
      />
      <InputField
        label={t('property.graceDays')}
        type="number"
        min={0}
        max={PROPERTY_LIMITS.GRACE}
        value={value.graceDays ?? ''}
        error={error}
        required
        onChange={(e) => {
          onChange({ ...value, graceDays: e.target.valueAsNumber });
        }}
      />
    </>
  );
}
