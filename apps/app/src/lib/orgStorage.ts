// Organization-scoped localStorage.
//
// Every host (organization) accessed from the landing must keep its own
// in-progress questionnaire data isolated: a user can start host_1, jump back to
// the landing, and open host_2 without host_1's answers/results leaking in (which
// would corrupt the other host's report and statistics). Rather than clearing
// everything on every org switch (which would also destroy other hosts'
// in-progress work), we namespace each key by the active organization key.
//
// The active org key comes from the `organization-key` cookie, which the
// middleware sets/refreshes on every keyed request, so it always reflects the
// host the visitor is currently in. When there's no key yet (e.g. before the
// cookie is set) we fall back to a shared "default" namespace.

const readOrgKey = (): string => {
  if (typeof document === "undefined") return "default"
  const match = document.cookie.match(/(?:^|;\s*)organization-key=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : "default"
}

/** Prefixes a logical key with the current organization namespace. */
const namespacedKey = (key: string): string => `org:${readOrgKey()}:${key}`

/**
 * Drop-in replacement for the subset of the localStorage API used across the
 * questionnaire flow. Keys are transparently namespaced per organization so the
 * call sites keep using their existing logical key names (e.g. "form", "gaps").
 */
export const orgStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem(namespacedKey(key))
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return
    window.localStorage.setItem(namespacedKey(key), value)
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(namespacedKey(key))
  },
}
