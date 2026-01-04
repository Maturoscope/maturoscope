"use server"

import { Locale } from "@/dictionaries/dictionaries"
import { getOrganizationKeyFromCookies } from "./organization"

interface AnswerPayload {
  question: string
  answer: string
  comment: string
}

interface RecommendedServicePayload {
  name: string
  description: string
}

interface GapPayload {
  gapDescription: string
  hasServices: boolean
  recommendedServices: RecommendedServicePayload[]
}

interface ScalePayload {
  level: number
  phase: number
  phaseName: string
  phaseGoal: string
  strategicFocus: string
  primaryRisk: string
  isLowest: boolean
  gaps: GapPayload[]
  answers: AnswerPayload[]
}

export interface ReportPayload {
  completedOn: string
  projectName?: string
  signature?: string
  trl: ScalePayload
  mkrl: ScalePayload
  mfrl: ScalePayload
}

interface GenerateReportResponse {
  success: boolean
  data?: string // base64 encoded PDF
  error?: string
}

export const generateReport = async (
  lang: Locale,
  payload: ReportPayload
): Promise<GenerateReportResponse> => {
  try {
    const organizationKey = await getOrganizationKeyFromCookies()
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/report/${lang}${organizationKey ? `?organizationKey=${organizationKey}` : ""}`

    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for PDF generation

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store", // Ensure fresh connection
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      
      // Log 403 errors with more context for debugging
      if (response.status === 403) {
        console.error("403 Forbidden error when generating PDF:", {
          endpoint,
          status: response.status,
          errorText: errorText.substring(0, 200), // Limit log size
        })
      }
      
      return {
        success: false,
        error: `Failed to generate PDF: ${response.status} ${errorText}`,
      }
    }

    // Convert the response to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    return {
      success: true,
      data: base64,
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: "PDF generation timeout - please try again",
        }
      }
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: "Network error - please check your connection",
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }
    
    return {
      success: false,
      error: "Unknown error occurred",
    }
  }
}
