import { StageId } from "@/components/custom/FormPage/Form/Form"

// What the user is evaluating. Purely a UI aid on the "begin" screen: it drives
// which dimensions are recommended/pre-checked and whether the disclaimer is
// shown. The actual assessment output is still the selected scales.
export type EvaluationType = "product" | "software" | "service"

export const EVALUATION_TYPES: EvaluationType[] = [
  "product",
  "software",
  "service",
]

// Recommended (and pre-checked) dimensions per evaluation type. TRL and MfRL
// were designed for physical products, so only a Product recommends all three.
export const RECOMMENDED_BY_TYPE: Record<EvaluationType, StageId[]> = {
  product: ["trl", "mkrl", "mfrl"],
  software: ["mkrl"],
  service: ["mkrl"],
}

export const EVALUATION_TYPE_KEY = "evaluationType"

const isEvaluationType = (value: unknown): value is EvaluationType =>
  value === "product" || value === "software" || value === "service"

export const getEvaluationType = (): EvaluationType | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(EVALUATION_TYPE_KEY)
  return isEvaluationType(stored) ? stored : null
}

export const setEvaluationType = (type: EvaluationType): void => {
  localStorage.setItem(EVALUATION_TYPE_KEY, type)
}
