import type { Metadata } from "next";
import { RequirePermission } from "@/components/auth/require-permission";
import { UsersScreen } from "@/components/users/users-screen";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <RequirePermission permission="user:read">
      <UsersScreen />
    </RequirePermission>
  );
}
