import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Users",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Users"
      description="People who can sign in to this organization."
    />
  );
}
