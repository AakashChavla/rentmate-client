import { vi } from 'vitest';
import { unitServices, unitFixture, unitIdentity } from './unit-fixture';
import type { Services } from '../providers/services.contract';
import type { Tenant, TenantsApi } from '../features/tenants';
import type { Lease, LeasesApi } from '../features/leases';
export function tenantFixture(): Tenant {
  const unit = unitFixture();
  return {
    id: '00000000-0000-4000-8000-000000000051',
    organizationId: unit.organizationId,
    propertyId: unit.propertyId,
    fullName: 'Fixture Tenant',
    phone: '1234567890',
    email: 'tenant@fixture.test',
    status: 'VERIFIED',
    userId: unitIdentity().user.id,
    emergencyContact: null,
    maskedId: '••••9012',
    reviewReason: null,
    createdAt: unit.createdAt,
  };
}
export function leaseFixture(status: Lease['status'] = 'PENDING_DEPOSIT'): Lease {
  const unit = unitFixture(),
    tenant = tenantFixture();
  return {
    id: '00000000-0000-4000-8000-000000000061',
    organizationId: unit.organizationId,
    propertyId: unit.propertyId,
    tenantId: tenant.id,
    unitId: unit.id,
    bedId: null,
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    rent: '12500.50',
    deposit: '25000.00',
    dueDay: 5,
    members: [],
    status,
    renewedFromId: null,
    terminatedAt: null,
    terminateReason: null,
    depositRecordedAt: null,
    depositReference: null,
    createdAt: unit.createdAt,
  };
}
export function rentalServices(): Services {
  const tenant = tenantFixture(),
    lease = leaseFixture();
  const tenants: TenantsApi = {
    list: vi.fn(() => Promise.resolve({ data: [tenant], requestId: null })),
    get: vi.fn(() => Promise.resolve(tenant)),
    create: vi.fn(() => Promise.resolve(tenant)),
    update: vi.fn(() => Promise.resolve(tenant)),
    review: vi.fn(() => Promise.resolve(tenant)),
    invite: vi.fn(() => Promise.resolve()),
    documents: vi.fn(() => Promise.resolve([])),
    upload: vi.fn(() => Promise.reject(new Error('Fixture upload retry'))),
    reviewDocument: vi.fn(() => Promise.reject(new Error('Unused review'))),
    download: vi.fn(() =>
      Promise.resolve({ url: '/private', expiresAt: '2026-01-01T00:00:00.000Z' }),
    ),
    removeDocument: vi.fn(() => Promise.resolve()),
  };
  const leases: LeasesApi = {
    list: vi.fn(() => Promise.resolve({ data: [lease], requestId: null })),
    get: vi.fn(() => Promise.resolve(lease)),
    create: vi.fn(() => Promise.resolve(lease)),
    available: vi.fn(() => Promise.resolve({ available: true })),
    deposit: vi.fn(() => Promise.resolve(lease)),
    renew: vi.fn(() => Promise.resolve(lease)),
    terminate: vi.fn(() => Promise.resolve(lease)),
  };
  return { ...unitServices(), tenants, leases };
}
