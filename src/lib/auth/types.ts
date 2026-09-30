export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthState = {
  user: AuthUser | null;
  permissions: string[];
  isLoading: boolean;
};
