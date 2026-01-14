"use server"

import { cookies } from "next/headers"
import { DEFAULT_ACCENT_THEME, DEFAULT_FONT_THEME } from "@/context/ThemeContext"

export type FontTheme = "geist" | "open-sans" | "inter" | "poppins"

export type AccentTheme =
  | "default"
  | "orange"
  | "blue"
  | "green"
  | "pink"
  | "violet"

const getOrganizationByKey = async (key: string | undefined) => {
  if (!key) return false

  const organizationKey = await getOrganizationKeyFromCookies()
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/organizations/key/${key}${organizationKey ? `?organizationKey=${organizationKey}` : ""}`
  const response = await fetch(endpoint)
  const organization = await response.json()

  return organization
}

export const getOrganizationTheme = async (
  key: string | null | undefined
): Promise<{ accentColor: AccentTheme, font: FontTheme }> => {
  if (!key) return { accentColor: DEFAULT_ACCENT_THEME, font: DEFAULT_FONT_THEME }

  try {
    const organization = await getOrganizationByKey(key)
    const { theme: accentColor, font } = organization

    return {
      accentColor: accentColor || DEFAULT_ACCENT_THEME,
      font: font || DEFAULT_FONT_THEME,
    }
  } catch (error) {
    console.error("Error fetching theme:", error)
    return {
      accentColor: DEFAULT_ACCENT_THEME,
      font: DEFAULT_FONT_THEME,
    }
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

export interface SelectedGap {
  questionId: string
  level: number
  recommendedServices: string[]
}

export interface ContactInformation {
  organization?: string
  country?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  additionalInformation?: string
}

interface RequestContactParams {
  gaps: SelectedGap[]
  contactInformation: ContactInformation
  projectName: string
  pdfCacheId?: string // Optional PDF cache ID
}

interface RequestContactResult {
  success: boolean
  error?: string
}

export const requestContact = async ({
  gaps,
  contactInformation,
  projectName,
  pdfCacheId,
}: RequestContactParams): Promise<RequestContactResult> => {
  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/services/contact?organizationKey=${organizationKey}`
  const body = {
    gaps,
    company: contactInformation.organization,
    firstName: contactInformation.firstName,
    lastName: contactInformation.lastName,
    email: contactInformation.email,
    phoneNumber: contactInformation.phoneNumber,
    additionalInformation: contactInformation.additionalInformation,
    projectName,
    pdfCacheId, // Include PDF cache ID if provided
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return { success: false, error: `API error: ${response.statusText}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error requesting contact:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export const getOrganizationSignature = async (): Promise<string | null> => {
  try {
    const organizationKey = await getOrganizationKeyFromCookies()
    if (!organizationKey) {
      return null
    }

    const organization = await getOrganizationByKey(organizationKey)
    if (!organization || typeof organization !== 'object') {
      return null
    }

    return organization.signature || null
  } catch (error) {
    console.error("Error fetching organization signature:", error)
    return null
  }
}

export { getOrganizationByKey }
