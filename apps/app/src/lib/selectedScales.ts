import { StageId } from "@/components/custom/FormPage/Form/Form"

// The user can choose which maturity scales to assess (1, 2 or all 3).
// The selection lives client-side only (localStorage), consistent with the
// rest of the stateless end-user assessment flow.

export const ALL_SCALES: StageId[] = ["trl", "mkrl", "mfrl"]

export const SELECTED_SCALES_KEY = "selectedScales"

const isStageId = (value: unknown): value is StageId =>
  value === "trl" || value === "mkrl" || value === "mfrl"

/**
 * Reads the selected scales from localStorage, preserving the canonical
 * TRL → MkRL → MfRL order. Falls back to all three scales when nothing is
 * stored or the stored value is invalid (backward compatibility with
 * assessments started before this feature existed).
 */
export const getSelectedScales = (): StageId[] => {
  if (typeof window === "undefined") return ALL_SCALES

  try {
    const raw = localStorage.getItem(SELECTED_SCALES_KEY)
    if (!raw) return ALL_SCALES

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return ALL_SCALES

    // Normalize: keep only valid ids, dedupe, and enforce canonical order.
    const selected = ALL_SCALES.filter(
      (scale) => parsed.includes(scale) && isStageId(scale)
    )

    return selected.length > 0 ? selected : ALL_SCALES
  } catch {
    return ALL_SCALES
  }
}

export const setSelectedScales = (scales: StageId[]): void => {
  // Persist in canonical order, always keeping at least one scale.
  const ordered = ALL_SCALES.filter((scale) => scales.includes(scale))
  const safe = ordered.length > 0 ? ordered : ALL_SCALES
  localStorage.setItem(SELECTED_SCALES_KEY, JSON.stringify(safe))
}

export const isScaleSelected = (scale: StageId): boolean =>
  getSelectedScales().includes(scale)
