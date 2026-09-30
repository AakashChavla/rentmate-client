import { LOGIN_PATH } from "@/lib/auth/constants";
import { sanitizeNext } from "@/lib/auth/redirect";

type SessionExpiredHandler = (currentPath: string) => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;

export function isAuthEntryPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/verify-otp" ||
    pathname === "/forgot-password"
  );
}

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

export function resetSessionExpiredForTests(): void {
  sessionExpiredNotified = false;
  sessionExpiredHandler = null;
}

export function resetSessionExpiredNotice(): void {
  sessionExpiredNotified = false;
}

/**
 * Called once when refresh fails. Public auth screens stay put so a missing
 * session does not toast or redirect-loop. The API remains the authority.
 */
export function notifySessionExpired(): void {
  if (typeof window === "undefined") return;
  if (isAuthEntryPath(window.location.pathname)) return;
  if (sessionExpiredNotified) return;
  sessionExpiredNotified = true;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (sessionExpiredHandler) {
    sessionExpiredHandler(currentPath);
    return;
  }

  const next = sanitizeNext(window.location.pathname);
  const target = next ? `${LOGIN_PATH}?next=${encodeURIComponent(next)}` : LOGIN_PATH;
  window.location.assign(target);
}
