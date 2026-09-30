"use server"

import { Locale } from "@/dictionaries/dictionaries"
import { getOrganizationKeyFromCookies } from "./organization"
import { createStructuredLogger } from "@/lib/structured-logger"
import { isStandaloneOrgKey } from "@/lib/standaloneOrg"

const logger = createStructuredLogger("actions/report")

interface AnswerPayload {
  question: string
  answer: string
  comment: string
  notApplicable?: boolean
}

interface RecommendedServicePayload {
  name: string
  description: string
  url?: string
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
  notScored: boolean
  gaps: GapPayload[]
  answers: AnswerPayload[]
}

export interface ReportPayload {
  completedOn: string
  projectName?: string
  signature?: string
  // Organization accent colour (hex) from the backend theme.
  accentColor?: string
  // Standalone orgs: the PDF lists gaps only, hiding services and their badges.
  hideServices?: boolean
  // Only the scales the user chose to assess are present.
  trl?: ScalePayload
  mkrl?: ScalePayload
  mfrl?: ScalePayload
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

    // Standalone orgs are example pages: gaps-only PDF (no services / badges)
    // and no organization signature ("by <logo>") in the header.
    const isStandalone = isStandaloneOrgKey(organizationKey)
    const body: ReportPayload = {
      ...payload,
      hideServices: isStandalone,
      signature: isStandalone ? undefined : payload.signature,
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      logger.error("PDF generation failed", new Error(response.statusText), {
        status: response.status,
        lang,
      })
      return {
        success: false,
        error: `Failed to generate PDF: ${response.statusText}`,
      }
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    return {
      success: true,
      data: base64,
    }
  } catch (error) {
    logger.error("Error generating report", error, { lang })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
