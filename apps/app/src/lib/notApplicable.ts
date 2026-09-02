import { getSelectedScales } from "@/lib/selectedScales"

// A question the user marks as "Not applicable" is stored with this sentinel
// value instead of a maturity level. It is non-numeric on purpose so the
// backend (which parses answers as level numbers) excludes it from every
// result calculation (level, gaps, risk, statistics).
//
// The user-facing label lives in the dictionaries (`common.notApplicableLabel`
// for the app, `answers.notApplicable` for the PDF) — never hard-coded here.
export const NOT_APPLICABLE_VALUE = "not_applicable"

export const isNotApplicable = (value: string | undefined | null): boolean =>
  value === NOT_APPLICABLE_VALUE

/**
 * True when EVERY assessed scale was marked entirely "Not applicable" (no
 * score anywhere). In that case there are no gaps to cover, so the results page
 * hides the report/expert CTAs and the closing banner.
 */
export const areAllScalesNotScored = (): boolean => {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem("notScored")
    const notScored = (raw ? JSON.parse(raw) : {}) as Record<string, boolean>
    const selected = getSelectedScales()
    return selected.length > 0 && selected.every((scale) => notScored[scale] === true)
  } catch {
    return false
  }
}
