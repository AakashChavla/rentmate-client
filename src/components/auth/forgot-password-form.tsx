"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiError } from "@/lib/api/client";
import { forgotPassword, resetPassword } from "@/lib/api/resources/auth";
import { applyApiFieldErrors } from "@/lib/forms/apply-api-errors";
import { emailField, newPasswordField, PASSWORD_HINT } from "@/lib/validation/password";

const emailSchema = z.object({ email: emailField });
type EmailValues = z.infer<typeof emailSchema>;

const resetSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type ResetValues = z.infer<typeof resetSchema>;

const SENT_TEXT = "If that email is registered, a code has been sent.";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  async function onRequest(values: EmailValues) {
    try {
      await forgotPassword({ email: values.email });
      setEmail(values.email);
    } catch (error) {
      if (error instanceof ApiError && (error.code === "RATE_LIMITED" || error.code === "OTP_LOCKED")) {
        const wait = error.retryAfterSeconds;
        emailForm.setError("email", {
          message:
            wait !== undefined
              ? `Too many attempts. Try again in ${wait} seconds.`
              : "Too many attempts. Wait a moment and try again.",
        });
        emailForm.setFocus("email");
        return;
      }
      emailForm.setError("email", { message: "Could not send a code. Try again." });
      emailForm.setFocus("email");
    }
  }

  async function onReset(values: ResetValues) {
    if (!email) return;
    try {
      await resetPassword({ email, code: values.code, newPassword: values.newPassword });
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/login");
    } catch (error) {
      if (error instanceof ApiError && applyApiFieldErrors(resetForm, error)) return;
      if (error instanceof ApiError && error.code === "OTP_INVALID") {
        resetForm.setError("code", { message: "That code is not valid." });
        resetForm.setFocus("code");
        return;
      }
      if (error instanceof ApiError && error.code === "OTP_EXPIRED") {
        resetForm.setError("code", { message: "That code has expired. Request a new one." });
        resetForm.setFocus("code");
        return;
      }
      if (error instanceof ApiError && error.code === "WEAK_PASSWORD") {
        resetForm.setError("newPassword", { message: error.message || PASSWORD_HINT });
        resetForm.setFocus("newPassword");
        return;
      }
      const message = error instanceof ApiError ? error.message : "Could not reset the password.";
      resetForm.setError("code", { message });
      resetForm.setFocus("code");
    }
  }

  if (!email) {
    return (
      <Form {...emailForm}>
        <form className="space-y-4" onSubmit={emailForm.handleSubmit(onRequest)} noValidate>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
            <p className="text-sm text-muted-foreground">{SENT_TEXT}</p>
          </div>
          <FormInput
            control={emailForm.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
            {emailForm.formState.isSubmitting ? "Sending…" : "Send code"}
          </Button>
          <Link href="/login" className="block text-center text-sm font-medium text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </form>
      </Form>
    );
  }

  return (
    <Form {...resetForm}>
      <form className="space-y-4" onSubmit={resetForm.handleSubmit(onReset)} noValidate>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="text-sm text-muted-foreground">{SENT_TEXT}</p>
        </div>
        <FormInput control={resetForm.control} name="code" label="Code" inputMode="numeric" autoComplete="one-time-code" />
        <FormInput
          control={resetForm.control}
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          description={PASSWORD_HINT}
        />
        <FormInput
          control={resetForm.control}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
          {resetForm.formState.isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </Form>
  );
}
