import { it, expect } from 'vitest';
import { sanitizeNext, getHomeRoute, can, isPrivateRoute } from './auth-policy';
import { identity } from '../test/identity';
it('rejects absolute, protocol-relative, encoded and backslash redirects, preserving safe queries', () => {
  for (const next of [
    'https://evil.test',
    '//evil.test',
    '/%2f%2fevil.test',
    '/\\evil.test',
    '/login?next=/login',
    '/register',
    '/\u0000evil',
  ])
    expect(sanitizeNext(next)).toBe('/dashboard');
  expect(sanitizeNext('/settings/users?status=ACTIVE')).toBe('/settings/users?status=ACTIVE');
  expect(isPrivateRoute('/settings/users')).toBe(true);
  expect(isPrivateRoute('/settings-other')).toBe(false);
});
it('uses tenant home only for tenant-only accounts and honors scope and expiration per assignment', () => {
  const me = identity();
  firstRole(me).role = 'TENANT';
  expect(getHomeRoute(me)).toBe('/tenant/dashboard');
  me.roles.push({ ...firstRole(me), role: 'PROPERTY_MANAGER' });
  expect(getHomeRoute(me)).toBe('/dashboard');
  me.roles = [
    { ...firstRole(me), scope: 'PROPERTY', scopeId: 'property-a', permissions: ['user:read'] },
  ];
  expect(can(me, 'user:read')).toBe(false);
  expect(can(me, 'user:read', { propertyId: 'property-a' })).toBe(true);
  firstRole(me).expiresAt = '2000-01-01T00:00:00.000Z';
  expect(can(me, 'user:read', { propertyId: 'property-a' })).toBe(false);
  expect(can(null, 'user:read')).toBe(false);
});
it('does not allow an expired platform administrator assignment to bypass permissions', () => {
  const me = identity();
  me.isPlatformAdmin = true;
  me.roles = [{ ...firstRole(me), role: 'SUPER_ADMIN', expiresAt: '2000-01-01T00:00:00.000Z' }];
  expect(can(me, 'platform:delete')).toBe(false);
});

function firstRole(me: ReturnType<typeof identity>): ReturnType<typeof identity>['roles'][number] {
  const role = me.roles[0];
  if (!role) throw new Error('Fixture role missing');
  return role;
}
