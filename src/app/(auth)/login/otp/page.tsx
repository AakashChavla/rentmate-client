import type { Metadata } from "next";
import { OtpRequestForm } from "@/components/auth/otp-request-form";

export const metadata: Metadata = {
  title: "Login with OTP",
};

export default function OtpLoginPage() {
  return <OtpRequestForm />;
}
