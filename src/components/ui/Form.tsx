'use client';
import { Controller, type ControllerProps, type FieldValues, FormProvider } from 'react-hook-form';
export const Form = FormProvider;
export function FormField<T extends FieldValues>(props: ControllerProps<T>): React.JSX.Element {
  return <Controller {...props} />;
}
