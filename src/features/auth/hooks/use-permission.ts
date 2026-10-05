'use client';
import { useAuth } from '../../../providers/AuthProvider';
import { can } from '../../../lib/auth-policy';
export function useCan(permission: string, scope: { propertyId?: string } = {}): boolean {
  return can(useAuth().me, permission, scope);
}
export function useHasPermission(permission: string): boolean {
  return useCan(permission);
}
