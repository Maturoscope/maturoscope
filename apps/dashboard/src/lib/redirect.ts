/**
 * Returns a safe, same-origin relative path from a user-supplied `redirect`
 * value, or the fallback. Rejects absolute URLs, protocol-relative URLs
 * (`//evil.com`, which the browser resolves to another origin) and backslash
 * variants (`/\evil.com`) to prevent open redirects after login/registration.
 */
export function sanitizeRedirect(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  const v = value.trim();
  if (!v.startsWith('/')) return fallback;
  if (v.startsWith('//') || v.startsWith('/\\') || v.startsWith('/%2f') || v.startsWith('/%5c')) {
    return fallback;
  }
  return v;
}
