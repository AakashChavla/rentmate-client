/**
 * Only same-origin relative paths may be used as a post-login redirect.
 * Rejects absolute URLs, protocol-relative URLs, and backslash tricks.
 */
export function sanitizeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return null;
  if (trimmed.includes("\\")) return null;
  if (trimmed.includes("://")) return null;
  return trimmed;
}

export function loginHref(nextPath?: string | null): string {
  const next = sanitizeNext(nextPath);
  if (!next) return "/login";
  return `/login?next=${encodeURIComponent(next)}`;
}
