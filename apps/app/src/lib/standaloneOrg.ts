// "Standalone" organizations (e.g. the Maturoscope demo org). They behave
// differently in the end-user app: they are hidden from the landing's Hosts list,
// and on the results page the contact CTA, the "next steps" box and the per-gap
// services are hidden — gaps are shown as a plain list instead.
//
// Configured via the NEXT_PUBLIC_STANDALONE_ORG_KEYS env var, a comma-separated
// list of organization keys, e.g. "maturoscope,other-key".

/** Parsed, lower-cased list of standalone organization keys from the env. */
export const getStandaloneOrgKeys = (): string[] =>
  (process.env.NEXT_PUBLIC_STANDALONE_ORG_KEYS ?? "")
    .split(",")
    .map((key) => key.trim().toLowerCase())
    .filter(Boolean)

/** Whether the given organization key is configured as standalone. */
export const isStandaloneOrgKey = (key: string | null | undefined): boolean => {
  if (!key) return false
  return getStandaloneOrgKeys().includes(key.toLowerCase())
}
