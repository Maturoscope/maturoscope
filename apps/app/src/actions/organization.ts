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

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/organizations/key/${key}`
  
  try {
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      // Ensure fresh connection
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch organization: ${response.status} ${response.statusText}`)
    }

    const organization = await response.json()
    return organization
  } catch (error) {
    console.error('Error fetching organization by key:', error)
    throw error
  }
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
  try {
    const cookieStore = await cookies()
    const key = cookieStore.get("organization-key")?.value || null
    
    if (!key) {
      console.warn("Organization key not found in cookies")
    }
    
    return key
  } catch (error) {
    console.error("Error reading organization key from cookies:", error)
    // Return null instead of throwing to allow graceful degradation
    return null
  }
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
}

interface RequestContactResult {
  success: boolean
  error?: string
}

export const requestContact = async ({
  gaps,
  contactInformation,
  projectName,
}: RequestContactParams): Promise<RequestContactResult> => {
  // Validate API URL is available
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not defined")
    return { success: false, error: "API configuration error" }
  }

  let organizationKey: string | null = null
  try {
    organizationKey = await getOrganizationKeyFromCookies()
  } catch (error) {
    console.error("Error getting organization key from cookies:", error)
    return { success: false, error: "Failed to read organization key" }
  }

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
  }

  try {
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      // Ensure fresh connection
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      
      // Log 403 errors with more context for debugging
      if (response.status === 403) {
        console.error("403 Forbidden error:", {
          endpoint,
          organizationKey: organizationKey ? "present" : "missing",
          status: response.status,
          errorText: errorText.substring(0, 200), // Limit log size
        })
      }
      
      return { success: false, error: `API error: ${response.status} ${errorText}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Error requesting contact:", error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: "Request timeout - please try again" }
      }
      if (error.message.includes('fetch')) {
        return { success: false, error: "Network error - please check your connection" }
      }
      return { success: false, error: error.message }
    }
    
    return {
      success: false,
      error: "Unknown error occurred",
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
