import { z } from "zod";
import { emailField } from "@/lib/validation/password";

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be at most 128 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;
