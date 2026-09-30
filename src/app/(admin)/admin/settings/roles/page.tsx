import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Roles",
};

export default function Page() {
  return (
    <PlaceholderPage title="Roles" description="Permission sets for staff accounts." />
  );
}
