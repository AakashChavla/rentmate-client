import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

/** Matches the server policy: 10–128 characters, at least one letter and one number. */
export const newPasswordField = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Use at most 128 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const PASSWORD_HINT = "10–128 characters, with at least one letter and one number.";
