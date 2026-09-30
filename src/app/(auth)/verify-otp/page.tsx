import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const metadata: Metadata = {
  title: "Verify code",
};

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
