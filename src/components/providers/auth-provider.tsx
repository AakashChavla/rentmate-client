"use client";

import { createContext, useMemo, type ReactNode } from "react";
import type { AuthState, AuthUser } from "@/lib/auth/types";

/**
 * Stub session until GET /auth/me is wired.
 * TODO: replace MOCK_USER and MOCK_PERMISSIONS with useQuery(["auth", "me"]).
 */
export const MOCK_USER: AuthUser = {
  id: "user_demo",
  name: "Demo Admin",
  email: "admin@rentmate.local",
  role: "org_admin",
};

export const MOCK_PERMISSIONS = [
  "invoice:generate",
  "property:read",
  "tenant:read",
  "complaint:read",
  "visitor:read",
  "report:read",
  "settings:read",
];

const defaultState: AuthState = {
  user: MOCK_USER,
  permissions: MOCK_PERMISSIONS,
  isLoading: false,
};

export const AuthContext = createContext<AuthState | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  /** Test override. Production renders the stub session. */
  value?: AuthState;
};

export function AuthProvider({ children, value }: AuthProviderProps) {
  const state = useMemo(() => value ?? defaultState, [value]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
