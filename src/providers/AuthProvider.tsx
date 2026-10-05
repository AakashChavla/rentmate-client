'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useServices } from './ServicesProvider';
import { loadIdentity } from './auth-query';
import { sanitizeNext } from '../lib/auth-policy';
import { AUTH_QUERY, AUTH_LIMITS } from '../config/auth.constants';
import { ROUTES, STORAGE_KEYS } from '../config/app.constants';
import type { Me, Credentials } from '../features/auth/api/auth-api';
export interface AuthState {
  me: Me | null;
  user: Me['user'] | null;
  organization: Me['organization'] | null;
  roles: Me['roles'];
  permissions: string[];
  isPlatformAdmin: boolean;
  onboarding: Me['onboarding'];
  isLoading: boolean;
  isAuthenticated: boolean;
  login(input: Credentials): Promise<Me>;
  logout(): Promise<void>;
  refetch(): Promise<void>;
  acceptSession: (me: Me) => void;
}
const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({
  children,
  sessionHint = false,
}: {
  children: ReactNode;
  sessionHint?: boolean;
}): React.JSX.Element {
  const services = useServices();
  const client = useQueryClient();
  const router = useRouter();
  const t = useTranslations();
  const [enabled, setEnabled] = useState(sessionHint);
  const query = useQuery({
    queryKey: AUTH_QUERY,
    queryFn: () => loadIdentity(services.auth, services.refresh),
    enabled,
    staleTime: AUTH_LIMITS.STALE,
    retry: false,
  });
  const { login, logout, acceptSession } = useSessionActions(
    services,
    client,
    router,
    t,
    setEnabled,
  );
  const refetch = async (): Promise<void> => {
    await query.refetch();
  };
  const me = query.data ?? null;
  return (
    <AuthContext.Provider
      value={{ ...identityState(me, query.isLoading), login, logout, refetch, acceptSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error(AUTH_PROVIDER_REQUIRED);
  return auth;
}
export function useOptionalAuth(): AuthState | undefined {
  return useContext(AuthContext);
}
const AUTH_PROVIDER_REQUIRED = 'AuthProvider is required';

function identityState(
  me: Me | null,
  isLoading: boolean,
): Pick<
  AuthState,
  | 'me'
  | 'user'
  | 'organization'
  | 'roles'
  | 'permissions'
  | 'isPlatformAdmin'
  | 'onboarding'
  | 'isLoading'
  | 'isAuthenticated'
> {
  return {
    me,
    user: me ? me.user : null,
    organization: me ? me.organization : null,
    roles: me ? me.roles : [],
    permissions: me ? me.permissions : [],
    isPlatformAdmin: !!me?.isPlatformAdmin,
    onboarding: me ? me.onboarding : { steps: [] },
    isLoading,
    isAuthenticated: !!me,
  };
}

function useSessionActions(
  services: ReturnType<typeof useServices>,
  client: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  t: ReturnType<typeof useTranslations<never>>,
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>,
): Pick<AuthState, 'login' | 'logout' | 'acceptSession'> {
  const acceptSession = useCallback(
    (me: Me): void => {
      services.refresh.activate();
      client.setQueryData(AUTH_QUERY, me);
      services.preferences.set(STORAGE_KEYS.LOCALE, me.user.locale);
      setEnabled(true);
    },
    [services, client],
  );
  useEffect(
    () =>
      services.refresh.subscribeExpired(() => {
        setEnabled(false);
        client.clear();
        client.setQueryData(AUTH_QUERY, null);
        toast.error(t('auth.sessionExpired'));
        const next = sanitizeNext(window.location.pathname + window.location.search);
        router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`);
      }),
    [services, client, router, t],
  );
  const login = async (input: Credentials): Promise<Me> => {
    const me = await services.auth.login(input);
    acceptSession(me);
    return me;
  };
  const logout = async (): Promise<void> => {
    try {
      await services.auth.logout();
    } finally {
      setEnabled(false);
      client.clear();
      client.setQueryData(AUTH_QUERY, null);
      router.replace(ROUTES.LOGIN);
      router.refresh();
    }
  };
  return { login, logout, acceptSession };
}
