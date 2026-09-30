import type { MeResponse } from "@/lib/api/resources/auth";

export type AuthContextValue = {
  user: MeResponse["user"] | null;
  organization: MeResponse["organization"] | null;
  roles: MeResponse["roles"];
  permissions: string[];
  isPlatformAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<MeResponse>;
  logout: () => Promise<void>;
  refetch: () => Promise<MeResponse | undefined>;
};
