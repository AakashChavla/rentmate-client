import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../providers/AuthProvider';
import type { Me, AuthApi } from '../features/auth';
export function identity(): Me {
  return {
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      organizationId: '00000000-0000-4000-8000-000000000002',
      email: 'owner@fixture.rentmate.test',
      fullName: 'Fixture Owner',
      phone: null,
      locale: 'en',
      status: 'ACTIVE',
      emailVerifiedAt: new Date().toISOString(),
      lastLoginAt: null,
      isPlatformAdmin: false,
      createdAt: new Date().toISOString(),
    },
    organization: {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Fixture org',
      slug: 'fixture',
      timezone: 'Asia/Kolkata',
      defaultLocale: 'en',
      isActive: true,
    },
    roles: [
      {
        id: 'assignment',
        userId: '00000000-0000-4000-8000-000000000001',
        organizationId: '00000000-0000-4000-8000-000000000002',
        role: 'ORG_OWNER',
        scope: 'ORGANIZATION',
        scopeId: '00000000-0000-4000-8000-000000000002',
        expiresAt: null,
        permissions: ['user:read', 'user:update', 'role:assign'],
      },
    ],
    permissions: ['user:read', 'user:update', 'role:assign'],
    isPlatformAdmin: false,
    onboarding: {
      steps: [
        { key: 'account', done: true },
        { key: 'property', done: false },
      ],
    },
  };
}
export function TestSession({ children, me }: { children: ReactNode; me: Me }): React.JSX.Element {
  const { acceptSession } = useAuth();
  useEffect(() => {
    acceptSession(me);
  }, [acceptSession, me]);
  return <>{children}</>;
}
export function fakeAuth(): AuthApi {
  return {
    me: () => Promise.resolve(identity()),
    login: () => Promise.resolve(identity()),
    logout: () => Promise.resolve(),
    refresh: () => Promise.resolve(),
    register: () => Promise.resolve(),
    verify: () => Promise.resolve(identity()),
    resend: () => Promise.resolve(),
    sendOtp: () => Promise.resolve(),
    verifyOtp: () => Promise.resolve(identity()),
    forgot: () => Promise.resolve(),
    reset: () => Promise.resolve(),
    change: () => Promise.resolve(),
  };
}
