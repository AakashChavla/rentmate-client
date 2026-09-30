import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { ApiError } from "@/lib/api/client";

export function applyApiFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: ApiError,
): boolean {
  const fields = error.fieldErrors();
  const names = Object.keys(fields);
  if (names.length === 0) return false;
  for (const name of names) {
    form.setError(name as FieldPath<T>, { type: "server", message: fields[name] });
  }
  const first = names[0];
  if (first) form.setFocus(first as FieldPath<T>);
  return true;
}
