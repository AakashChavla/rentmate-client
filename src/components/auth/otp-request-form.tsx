"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiError } from "@/lib/api/client";
import { sendOtp } from "@/lib/api/resources/auth";
import { emailField } from "@/lib/validation/password";

const schema = z.object({ email: emailField });
type Values = z.infer<typeof schema>;

const SENT_TEXT = "If that email is registered, a code has been sent.";

export function OtpRequestForm() {
  const router = useRouter();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await sendOtp({ email: values.email, purpose: "LOGIN" });
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "RATE_LIMITED") {
        form.setError("email", { message: "Too many attempts. Wait a moment and try again." });
        form.setFocus("email");
        return;
      }
      if (error instanceof ApiError && error.code === "OTP_LOCKED") {
        const wait = error.retryAfterSeconds;
        form.setError("email", {
          message:
            wait !== undefined
              ? `OTP is locked. Try again in ${wait} seconds.`
              : "OTP is locked. Try again later.",
        });
        form.setFocus("email");
        return;
      }
      form.setError("email", { message: "Could not send a code. Try again." });
      form.setFocus("email");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Login with OTP</h1>
          <p className="text-sm text-muted-foreground">{SENT_TEXT}</p>
        </div>
        <FormInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send code"}
        </Button>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Use password instead
        </Link>
      </form>
    </Form>
  );
}
