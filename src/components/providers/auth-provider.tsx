"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  type MeResponse,
} from "@/lib/api/resources/auth";
import { LOGIN_PATH } from "@/lib/auth/constants";
import { loginHref } from "@/lib/auth/redirect";
import { resetSessionExpiredNotice, setSessionExpiredHandler } from "@/lib/auth/session";
import type { AuthContextValue } from "@/lib/auth/types";

export const ME_QUERY_KEY = ["me"] as const;

export const AuthContext = createContext<AuthContextValue | null>(null);

function LiveAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    setSessionExpiredHandler((currentPath) => {
      queryClient.clear();
      toast.error("Session expired");
      window.location.assign(loginHref(currentPath));
    });
    return () => setSessionExpiredHandler(null);
  }, [queryClient]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const me = await loginRequest(input);
      queryClient.setQueryData(ME_QUERY_KEY, me);
      resetSessionExpiredNotice();
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      return me;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      queryClient.clear();
      window.location.assign(LOGIN_PATH);
    }
  }, [queryClient]);

  const refetch = useCallback(async () => {
    const result = await query.refetch();
    return result.data;
  }, [query]);

  const value = useMemo<AuthContextValue>(() => {
    const me: MeResponse | undefined = query.data;
    return {
      user: me?.user ?? null,
      organization: me?.organization ?? null,
      roles: me?.roles ?? [],
      permissions: me?.permissions ?? [],
      isPlatformAdmin: me?.isPlatformAdmin ?? false,
      isLoading: query.isPending,
      isAuthenticated: Boolean(me?.user),
      login,
      logout,
      refetch,
    };
  }, [login, logout, query.data, query.isPending, refetch]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type AuthProviderProps = {
  children: ReactNode;
  /** Test override. Skips the live `/auth/me` query. */
  value?: AuthContextValue;
};

export function AuthProvider({ children, value }: AuthProviderProps) {
  if (value) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }
  return <LiveAuthProvider>{children}</LiveAuthProvider>;
}
