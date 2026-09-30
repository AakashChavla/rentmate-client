import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Properties",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Properties"
      description="Buildings, wings, and units you operate."
    />
  );
}
