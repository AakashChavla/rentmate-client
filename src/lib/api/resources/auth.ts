import { apiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type MeResponse = components["schemas"]["MeResponseDto"];
export type LoginInput = components["schemas"]["LoginDto"];
export type OtpSendInput = components["schemas"]["OtpSendDto"];
export type OtpVerifyInput = components["schemas"]["OtpVerifyDto"];
export type PasswordForgotInput = components["schemas"]["PasswordForgotDto"];
export type PasswordResetInput = components["schemas"]["PasswordResetDto"];
export type PasswordChangeInput = components["schemas"]["PasswordChangeDto"];

export function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>("/auth/me");
}

export function login(input: LoginInput): Promise<MeResponse> {
  return apiClient<MeResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<components["schemas"]["LogoutDto"]> {
  return apiClient("/auth/logout", { method: "POST" });
}

export function sendOtp(input: OtpSendInput): Promise<{ accepted: boolean }> {
  return apiClient("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyOtp(input: OtpVerifyInput): Promise<MeResponse> {
  return apiClient<MeResponse>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function forgotPassword(input: PasswordForgotInput): Promise<{ accepted?: boolean }> {
  return apiClient("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetPassword(
  input: PasswordResetInput,
): Promise<components["schemas"]["PasswordChangedDto"]> {
  return apiClient("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function changePassword(
  input: PasswordChangeInput,
): Promise<components["schemas"]["PasswordChangedDto"]> {
  return apiClient("/auth/password/change", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
