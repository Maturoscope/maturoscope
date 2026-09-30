// Since the marketing landing now lives at the bare locale root (/{lang}), a
// questionnaire that "leaves" or "finishes" must return to the ORGANIZATION's
// home page (/{lang}?key=<org>) instead — otherwise the user is dropped on the
// public landing. The organization key is read from the cookie, which persists
// across the questionnaire reset.

/** Reads the current organization key from the cookie (client-side only). */
export const getOrgKeyFromCookie = (): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)organization-key=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** URL of the organization's home page for the given locale (falls back to root). */
export const getOrgHomeUrl = (lang: string): string => {
  const key = getOrgKeyFromCookie()
  return key ? `/${lang}?key=${key}` : `/${lang}`
}
