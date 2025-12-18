"use server"

import { Locale } from "@/dictionaries/dictionaries"

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/report/${lang}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to generate PDF: ${response.statusText}`,
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
