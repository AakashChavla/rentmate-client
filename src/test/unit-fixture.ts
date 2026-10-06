import { vi } from 'vitest';
import type { Services } from '../providers/services.contract';
import type { Unit, UnitsApi } from '../features/units/api/units-api';
import type { Me } from '../features/auth';
import { domainServices, domainIdentity, propertyFixture } from './domain-fixture';
import { UNIT_PERMISSION } from '../config/unit.constants';
export function unitFixture(status: Unit['status'] = 'VACANT'): Unit {
  return {
    id: '00000000-0000-4000-8000-000000000041',
    organizationId: domainIdentity().organization.id,
    propertyId: propertyFixture().id,
    floorId: null,
    code: 'R101',
    type: 'ROOM',
    status,
    baseRent: '5000.00',
    capacity: 2,
    createdAt: new Date().toISOString(),
    floorName: 'First',
    floorLevel: 1,
    wing: 'A',
  };
}
export function unitIdentity(permissions: string[] = Object.values(UNIT_PERMISSION)): Me {
  const me = domainIdentity();
  me.permissions.push(...permissions);
  for (const role of me.roles) role.permissions = [...(role.permissions ?? []), ...permissions];
  return me;
}
export function unitServices(): Services {
  const unit = unitFixture();
  const config = { amenities: [], size: null, furnishing: 'UNFURNISHED' } as const;
  const units: UnitsApi = {
    list: vi.fn(() => Promise.resolve({ data: [unit], requestId: null })),
    get: vi.fn(() => Promise.resolve(unit)),
    create: vi.fn(() => Promise.resolve(unit)),
    update: vi.fn(() => Promise.resolve(unit)),
    remove: vi.fn(() => Promise.resolve()),
    status: vi.fn((id: string, status: Unit['status']) => Promise.resolve({ ...unit, id, status })),
    config: vi.fn(() => Promise.resolve({ ...config, amenities: [] })),
    setConfig: vi.fn(() => Promise.resolve({ ...config, amenities: [] })),
    ...floorBedFakes(unit),
    bulk: vi.fn<UnitsApi['bulk']>(() =>
      Promise.resolve({ mode: 'SYNC', createdCount: 6, jobId: null, status: 'COMPLETED' }),
    ),
    job: vi.fn(() => Promise.reject(new Error('Unused fixture job'))),
    occupancy: vi.fn(() =>
      Promise.resolve({
        units: { occupied: 1, total: 4, percent: 25 },
        beds: { occupied: 0, total: 0, percent: 0 },
      }),
    ),
  };
  return { ...domainServices(), units };
}

function floorBedFakes(
  unit: Unit,
): Pick<
  UnitsApi,
  | 'floors'
  | 'createFloor'
  | 'updateFloor'
  | 'removeFloor'
  | 'beds'
  | 'createBed'
  | 'updateBed'
  | 'bedStatus'
  | 'removeBed'
> {
  return {
    floors: vi.fn(() => Promise.resolve([])),
    createFloor: vi.fn(() => Promise.resolve(floorRecord(unit))),
    updateFloor: vi.fn(() => Promise.resolve(floorRecord(unit))),
    removeFloor: vi.fn(() => Promise.resolve()),
    beds: vi.fn(() => Promise.resolve([])),
    createBed: vi.fn(() => Promise.resolve(bedRecord(unit))),
    updateBed: vi.fn(() => Promise.resolve(bedRecord(unit))),
    bedStatus: vi.fn((id: string, status: Unit['status']) =>
      Promise.resolve({ ...bedRecord(unit), id, status }),
    ),
    removeBed: vi.fn(() => Promise.resolve()),
  };
}
function floorRecord(unit: Unit): import('../features/units/api/units-api').Floor {
  return {
    id: 'floor',
    organizationId: unit.organizationId,
    propertyId: unit.propertyId,
    name: 'First',
    level: 1,
    wing: 'A',
    createdAt: unit.createdAt,
  };
}
function bedRecord(unit: Unit): import('../features/units/api/units-api').Bed {
  return {
    id: 'bed',
    organizationId: unit.organizationId,
    propertyId: unit.propertyId,
    unitId: unit.id,
    label: 'A',
    status: 'VACANT',
    createdAt: unit.createdAt,
  };
}
