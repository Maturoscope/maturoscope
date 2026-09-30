"use client"

/**
 * Previously this component wiped ALL localStorage whenever the visitor switched
 * organizations, to stop one host's answers from bleeding into another. That was
 * both unreliable (the middleware refreshes the organization-key cookie before
 * this ran, so the mismatch was rarely detected) and destructive (it erased any
 * other host's in-progress questionnaire).
 *
 * Isolation is now handled by namespacing every questionnaire key per
 * organization in localStorage — see {@link file://../../../lib/orgStorage.ts}.
 * Each host reads and writes under its own `org:<key>:*` namespace, so multiple
 * in-progress questionnaires coexist safely and no cross-host reset is needed.
 *
 * The component is kept as a no-op so existing mount points don't need changing.
 */
const OrganizationKeyHandler = () => null

export default OrganizationKeyHandler
