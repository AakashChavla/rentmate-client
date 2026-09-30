import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Complaints",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Complaints"
      description="Requests you have raised with the property."
    />
  );
}
