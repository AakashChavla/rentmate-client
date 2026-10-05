import { testServices } from './render';
import { identity, fakeAuth } from './identity';
import type { Services } from '../providers/ServicesProvider';
import type { Property } from '../features/properties';
import type { Me } from '../features/auth';
export function domainIdentity(): Me {
  const me = identity();
  const permissions = [
    'user:read',
    'user:update',
    'role:assign',
    'user:invite',
    'property:read',
    'property:create',
    'property:update',
    'property:delete',
    'organization:read',
    'organization:update',
  ];
  for (const role of me.roles) role.permissions = permissions;
  me.permissions = permissions;
  me.onboarding.steps = [
    { key: 'verifyEmail', done: true },
    { key: 'create_first_property', done: false },
  ];
  return me;
}
export function propertyFixture(): Property {
  return {
    id: '00000000-0000-4000-8000-000000000003',
    organizationId: identity().organization.id,
    name: 'Garden House',
    type: 'HOTEL',
    addressLine1: 'Fixture Road',
    addressLine2: null,
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    country: 'IN',
    timezone: null,
    status: 'ACTIVE',
    createdAt: '2026-10-05T00:00:00.000Z',
  };
}
export function domainServices(): Services {
  const services = testServices();
  const property = propertyFixture();
  const preferences = new Map<string, string>();
  services.preferences = {
    get: (key) => preferences.get(key),
    set: (key, value) => {
      preferences.set(key, value);
    },
  };
  services.auth = { ...fakeAuth(), me: () => Promise.resolve(domainIdentity()) };
  services.properties = {
    list: () => Promise.resolve({ data: [property], requestId: 'fixture' }),
    get: () => Promise.resolve(property),
    create: (input) =>
      Promise.resolve({
        ...property,
        ...input,
        addressLine2: input.addressLine2 ?? null,
        timezone: input.timezone ?? null,
      }),
    update: (_id, input) => Promise.resolve({ ...property, ...input }),
    remove: () => Promise.resolve(),
    config: () => Promise.resolve({ currency: 'INR', checkInTime: '14:00', checkOutTime: '11:00' }),
    setConfig: (_id, input) =>
      Promise.resolve({ currency: 'INR', checkInTime: '14:00', checkOutTime: '11:00', ...input }),
  };
  services.organization = {
    get: () => Promise.resolve(domainIdentity().organization),
    update: (input) => Promise.resolve({ ...domainIdentity().organization, ...input }),
  };
  services.invitations = invitationFixture();
  return services;
}
function invitationFixture(): Services['invitations'] {
  return {
    list: () => Promise.resolve({ data: [], requestId: 'fixture' }),
    create: (input) =>
      Promise.resolve({
        id: 'invite',
        ...input,
        scopeId: input.scopeId ?? identity().organization.id,
        status: 'PENDING',
        expiresAt: '2026-10-12T00:00:00.000Z',
        createdAt: '2026-10-05T00:00:00.000Z',
        locale: 'en',
      }),
    resend: () =>
      Promise.resolve({
        id: 'invite',
        email: 'invite@fixture.rentmate.test',
        roleKey: 'PROPERTY_MANAGER',
        scopeType: 'ORGANIZATION',
        scopeId: identity().organization.id,
        status: 'PENDING',
        expiresAt: '2026-10-12T00:00:00.000Z',
        createdAt: '2026-10-05T00:00:00.000Z',
        locale: 'en',
      }),
    revoke: () => Promise.resolve(),
    accept: () => Promise.resolve({ accepted: true, roleKey: 'PROPERTY_MANAGER', locale: 'en' }),
  };
}
