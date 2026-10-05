'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { useAuthSubmission } from '../../auth';
import {
  detailsSchema,
  addressSchema,
  CONFIG_SCHEMAS,
  initialProperty,
  defaultConfig,
  type PropertyFields,
} from '../schemas/property.schema';
import type { Property, PropertyConfig } from '../api/properties-api';
import { WIZARD_STEP as S, DOMAIN_QUERY, propertyRoute } from '../../../config/property.constants';
type usePropertyWizardContract = {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  fields: PropertyFields;
  change: (value: PropertyFields) => void;
  configuration: import('../../../lib/api/schema').components['schemas']['PropertyConfigDto'];
  setConfig: React.Dispatch<
    React.SetStateAction<
      import('../../../lib/api/schema').components['schemas']['PropertyConfigDto']
    >
  >;
  invalid: boolean;
  next: () => void;
  save: () => void;
  submission: ReturnType<typeof useAuthSubmission>;
};
export function usePropertyWizard(
  property?: Property,
  config?: PropertyConfig,
): usePropertyWizardContract {
  const services = useServices();
  const auth = useAuth();
  const [router, client] = [useRouter(), useQueryClient()] as const;
  const submission = useAuthSubmission();
  const [step, setStep] = useState<number>(S.DETAILS);
  const [fields, setFields] = useState(initialProperty(property));
  const [configuration, setConfig] = useState(config ?? defaultConfig(fields.type));
  const [invalid, setInvalid] = useState(false);
  const change = (value: PropertyFields): void => {
    if (fields.type !== value.type) setConfig(defaultConfig(value.type));
    setFields(value);
    setInvalid(false);
  };
  const next = (): void => {
    const result = (step === S.DETAILS ? detailsSchema : addressSchema).safeParse(fields);
    setInvalid(!result.success);
    if (result.success) setStep(step + 1);
  };
  const save = (): void => {
    const valid =
      detailsSchema.safeParse(fields).success &&
      addressSchema.safeParse(fields).success &&
      CONFIG_SCHEMAS[fields.type].safeParse(configuration).success;
    setInvalid(!valid);
    if (!valid) return;
    void submission.run(async () => {
      const saved = await persistProperty(services, property, fields, configuration);
      await client.invalidateQueries({ queryKey: DOMAIN_QUERY.PROPERTIES });
      await client.invalidateQueries({ queryKey: DOMAIN_QUERY.MINE });
      await auth.refetch();
      router.push(propertyRoute(saved.id));
    });
  };
  return {
    step,
    setStep,
    fields,
    change,
    configuration,
    setConfig,
    invalid,
    next,
    save,
    submission,
  };
}

async function persistProperty(
  services: ReturnType<typeof useServices>,
  property: Property | undefined,
  fields: PropertyFields,
  configuration: PropertyConfig,
): Promise<Property> {
  const { type, timezone, ...address } = fields;
  const input = { ...address, ...(timezone ? { timezone } : {}) };
  const saved = property
    ? await services.properties.update(property.id, { ...input, timezone: timezone || null })
    : await services.properties.create({ ...input, type, configuration });
  if (property) await services.properties.setConfig(saved.id, configuration);
  return saved;
}
