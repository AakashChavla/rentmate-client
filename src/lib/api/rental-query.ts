export interface RentalFilter {
  propertyId?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
  cursor?: string | undefined;
  tenantId?: string | undefined;
}
export function rentalQuery(filter: RentalFilter): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) query.set(key, String(value));
  return '?' + query.toString();
}
