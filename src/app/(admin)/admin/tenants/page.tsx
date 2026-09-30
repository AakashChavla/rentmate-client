import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Tenants",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Tenants"
      description="People staying in or leasing your properties."
    />
  );
}
