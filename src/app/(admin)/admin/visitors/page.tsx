import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Visitors",
};

export default function Page() {
  return <PlaceholderPage title="Visitors" description="Guest and visitor logs." />;
}
