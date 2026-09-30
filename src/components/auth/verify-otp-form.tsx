"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ME_QUERY_KEY } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCountdown } from "@/hooks/use-countdown";
import { ApiError } from "@/lib/api/client";
import { sendOtp, verifyOtp } from "@/lib/api/resources/auth";
import { getHomeRoute } from "@/lib/auth/home";
import { resetSessionExpiredNotice } from "@/lib/auth/session";

const SENT_TEXT = "If that email is registered, a code has been sent.";

function otpMessage(error: ApiError): string {
  if (error.code === "OTP_INVALID") return "That code is not valid.";
  if (error.code === "OTP_EXPIRED") return "That code has expired. Send a new one.";
  if (error.code === "OTP_LOCKED") {
    const wait = error.retryAfterSeconds;
    return wait !== undefined
      ? `Too many attempts. Try again in ${wait} seconds.`
      : "Too many attempts. Try again later.";
  }
  if (error.code === "RATE_LIMITED") return "Too many attempts. Wait a moment and try again.";
  return error.message;
}

export function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendFrom, setResendFrom] = useState(60);
  const remaining = useCountdown(resendFrom);

  async function submit(value: string) {
    if (!email || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const me = await verifyOtp({ email, purpose: "LOGIN", code: value });
      queryClient.setQueryData(ME_QUERY_KEY, me);
      resetSessionExpiredNotice();
      router.replace(getHomeRoute(me));
    } catch (caught) {
      setCode("");
      setError(caught instanceof ApiError ? otpMessage(caught) : "Could not verify that code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email || (remaining ?? 0) > 0) return;
    setError(null);
    try {
      await sendOtp({ email, purpose: "LOGIN" });
      setResendFrom(60);
    } catch (caught) {
      setError(caught instanceof ApiError ? otpMessage(caught) : "Could not send a new code.");
    }
  }

  if (!email) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
        <p className="text-sm text-muted-foreground">Start by requesting a code for your email.</p>
        <Link href="/login/otp" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Request a code
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
        <p className="text-sm text-muted-foreground">{SENT_TEXT}</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="otp-code" className="text-sm font-medium">
          6-digit code
        </label>
        <InputOTP
          id="otp-code"
          maxLength={6}
          value={code}
          onChange={(value) => {
            setCode(value);
            if (value.length === 6) void submit(value);
          }}
          aria-describedby={error ? "otp-error" : undefined}
          aria-invalid={error ? true : undefined}
          disabled={submitting}
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {error ? (
          <p id="otp-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={() => void resend()} disabled={(remaining ?? 0) > 0}>
        {(remaining ?? 0) > 0 ? `Resend code in ${remaining}s` : "Resend code"}
      </Button>
      <p role="status" aria-live="polite" className="sr-only">
        {(remaining ?? 0) > 0 ? `You can resend a code in ${remaining} seconds.` : "You can resend a code."}
      </p>
    </div>
  );
}
