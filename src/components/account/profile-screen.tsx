"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { changePassword } from "@/lib/api/resources/auth";
import { applyApiFieldErrors } from "@/lib/forms/apply-api-errors";
import { newPasswordField, PASSWORD_HINT } from "@/lib/validation/password";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function ProfileScreen() {
  const { user, organization, roles, refetch } = useAuth();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      await refetch();
      form.reset();
      toast.success("Password updated. Other sessions were signed out.");
    } catch (error) {
      if (error instanceof ApiError && applyApiFieldErrors(form, error)) return;
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        form.setError("currentPassword", { message: "Current password is incorrect." });
        form.setFocus("currentPassword");
        return;
      }
      if (error instanceof ApiError && error.code === "WEAK_PASSWORD") {
        form.setError("newPassword", { message: error.message || PASSWORD_HINT });
        form.setFocus("newPassword");
        return;
      }
      const message = error instanceof ApiError ? error.message : "Could not update the password.";
      form.setError("currentPassword", { message });
      form.setFocus("currentPassword");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account in this workspace." />
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{user?.fullName ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Organization</p>
            <p className="font-medium">{organization?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Roles</p>
            <p className="font-medium">
              {roles.length > 0 ? roles.map((role) => role.key).join(", ") : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="max-w-md space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormInput
                control={form.control}
                name="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
              />
              <FormInput
                control={form.control}
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                description={PASSWORD_HINT}
              />
              <FormInput
                control={form.control}
                name="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Update password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
