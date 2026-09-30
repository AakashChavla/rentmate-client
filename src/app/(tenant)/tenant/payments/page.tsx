import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Payments",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Payments"
      description="Rent and other charges on your account."
    />
  );
}
