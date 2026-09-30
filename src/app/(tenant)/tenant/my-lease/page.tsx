import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "My lease",
};

export default function Page() {
  return (
    <PlaceholderPage title="My lease" description="Agreement, unit, and stay dates." />
  );
}
