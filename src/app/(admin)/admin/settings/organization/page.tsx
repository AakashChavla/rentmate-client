import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Organization",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Organization"
      description="Workspace name, timezone, and billing profile."
    />
  );
}
