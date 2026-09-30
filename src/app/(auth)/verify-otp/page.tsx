import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Verify OTP",
};

export default function VerifyOtpPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Verify OTP</h1>
        <p className="text-sm text-muted-foreground">
          Confirm the code sent to your email.
        </p>
      </div>
      <EmptyState
        title="Coming soon"
        description="OTP verification will be available in a later phase."
      />
    </div>
  );
}
