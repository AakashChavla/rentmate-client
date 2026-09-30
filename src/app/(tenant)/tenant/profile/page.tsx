import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Your contact details and preferences."
    />
  );
}
