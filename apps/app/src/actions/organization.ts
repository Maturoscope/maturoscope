"use server"

import { cookies } from "next/headers"
import { DEFAULT_ACCENT_THEME } from "@/context/ThemeContext"

export type AccentTheme =
  | "default"
  | "orange"
  | "blue"
  | "green"
  | "pink"
  | "violet"

const VALID_ACCENT_THEMES: AccentTheme[] = [
  "default",
  "orange",
  "blue",
  "green",
  "pink",
  "violet",
]

const getOrganizationByKey = async (key: string | undefined) => {
  if (!key) return false

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/organizations/${key}`
  const response = await fetch(endpoint)
  const organization = await response.json()

  return organization
}

export const getOrganizationAccentColor = async (
  key: string | null | undefined
): Promise<AccentTheme> => {
  if (!key) return "default"

  try {
    const organization = await getOrganizationByKey(key)
    const accentColor = organization?.accentColor || organization?.theme || null

    if (accentColor && VALID_ACCENT_THEMES.includes(accentColor)) {
      return accentColor as AccentTheme
    }

    return DEFAULT_ACCENT_THEME
  } catch (error) {
    console.error("Error fetching accent color:", error)
    return DEFAULT_ACCENT_THEME
  }
}

export const getOrganizationKeyFromCookies = async (): Promise<
  string | null
> => {
  const cookieStore = await cookies()
  return cookieStore.get("organization-key")?.value || null
}

export type ScaleType = "TRL" | "MkRL" | "MfRL"

export interface LocalizedText {
  en: string
  fr: string
}

export interface DevelopmentPhase {
  phase: number
  phaseName: LocalizedText
  focusGoal: LocalizedText
  scaleRange: string
}

export interface RecommendedService {
  id: string
  name: LocalizedText
  description: LocalizedText
}

export interface Gap {
  questionId: string
  level: number
  gapDescription: LocalizedText
  hasServices: boolean
  recommendedServices: RecommendedService[]
}

export interface AssessmentResponse {
  scale: ScaleType
  readinessLevel: number
  developmentPhase: DevelopmentPhase
  gaps: Gap[]
}

interface SubmitAssessmentParams {
  scale: ScaleType
  answers: Record<string, string>
}

interface SubmitAssessmentResult {
  success: boolean
  data?: AssessmentResponse
  error?: string
}

export const submitAssessment = async ({
  scale,
  answers,
}: SubmitAssessmentParams): Promise<SubmitAssessmentResult> => {
  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/assess?organizationKey=${organizationKey}`

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scale, answers }),
    })

    if (!response.ok) {
      return { success: false, error: `API error: ${response.statusText}` }
    }

    const data: AssessmentResponse = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error submitting assessment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export { getOrganizationByKey }
