import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Your stay, dues, and open requests."
    />
  );
}
