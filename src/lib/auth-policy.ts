import type { components } from './api/schema';
import { ROUTES } from '../config/app.constants';
import {
  IDENTITY_ROLE,
  ROLE_SCOPE,
  PRIVATE_PREFIXES,
  PERMISSION,
  NEXT_CHARACTER_LIMIT,
} from '../config/auth.constants';
export function sanitizeNext(
  input: string | null | undefined,
  fallback: string = ROUTES.DASHBOARD,
): string {
  if (!input || !safePath(input)) return fallback;
  try {
    const decoded = decodeURIComponent(input);
    if (!safePath(decoded)) return fallback;
    const url = new URL(input, SAFE_ORIGIN);
    if (
      url.origin !== SAFE_ORIGIN ||
      url.pathname.startsWith(ROUTES.LOGIN) ||
      url.pathname.startsWith(ROUTES.REGISTER)
    )
      return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
export function getHomeRoute(me: components['schemas']['MeDto']): string {
  return me.roles.length > 0 && me.roles.every((role) => role.role === IDENTITY_ROLE.TENANT)
    ? ROUTES.TENANT_DASHBOARD
    : ROUTES.DASHBOARD;
}
export function can(
  me: components['schemas']['MeDto'] | null | undefined,
  permission: string,
  scope: { propertyId?: string } = {},
): boolean {
  if (!me) return false;
  if (permission === PERMISSION.AUTHENTICATED) return true;
  if (
    me.isPlatformAdmin &&
    me.roles.some(
      (role) =>
        role.role === IDENTITY_ROLE.SUPER_ADMIN &&
        (!role.expiresAt || new Date(role.expiresAt) > new Date()),
    )
  )
    return true;
  return me.roles.some(
    (role) =>
      (!role.expiresAt || new Date(role.expiresAt) > new Date()) &&
      !!role.permissions?.includes(permission) &&
      (role.scope === ROLE_SCOPE.ORGANIZATION || role.scopeId === scope.propertyId),
  );
}
export function isPrivateRoute(path: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
const SAFE_ORIGIN = 'https://rentmate.invalid';

function safePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('\\') &&
    !Array.from(path).some((character) => character.charCodeAt(0) < NEXT_CHARACTER_LIMIT)
  );
}
