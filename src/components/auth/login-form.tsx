"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCountdown } from "@/hooks/use-countdown";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { getHomeRoute } from "@/lib/auth/home";
import { sanitizeNext } from "@/lib/auth/redirect";
import { loginSchema, type LoginValues } from "@/lib/validation/login";

function messageFor(error: ApiError): { field: "email" | "password"; message: string } | null {
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return {
        field: "password",
        message: "Those credentials don’t match our records.",
      };
    case "ACCOUNT_SUSPENDED":
      return {
        field: "email",
        message: "This account is suspended. Contact your workspace admin.",
      };
    case "RATE_LIMITED":
      return {
        field: "email",
        message: "Too many attempts. Wait a moment and try again.",
      };
    default:
      return null;
  }
}

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lockSeconds, setLockSeconds] = useState<number | null>(null);
  const remaining = useCountdown(lockSeconds);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLockSeconds(null);
    try {
      const me = await auth.login(values);
      const next = sanitizeNext(searchParams.get("next"));
      router.replace(next ?? getHomeRoute(me));
    } catch (error) {
      if (!(error instanceof ApiError)) {
        form.setError("password", { message: "Could not sign in. Try again." });
        form.setFocus("password");
        return;
      }
      if (error.code === "ACCOUNT_LOCKED") {
        setLockSeconds(error.retryAfterSeconds ?? 0);
        form.setFocus("password");
        return;
      }
      const mapped = messageFor(error);
      if (mapped) {
        form.setError(mapped.field, { message: mapped.message });
        form.setFocus(mapped.field);
        return;
      }
      const fields = error.fieldErrors();
      const first = Object.keys(fields)[0] as "email" | "password" | undefined;
      if (first && fields[first]) {
        form.setError(first, { message: fields[first] });
        form.setFocus(first);
        return;
      }
      form.setError("password", { message: error.message });
      form.setFocus("password");
    }
  }

  const locked = remaining !== null && remaining > 0;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use the email and password for your RentMate workspace.
          </p>
        </div>
        <FormInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@property.com"
        />
        <FormInput
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        {locked ? (
          <p role="status" aria-live="polite" className="text-sm text-destructive">
            This account is locked. Try again in {remaining} seconds.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/login/otp"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Login with OTP
          </Link>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || locked}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
