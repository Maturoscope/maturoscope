"use server"

// Packages
import { cookies } from "next/headers"
import { randomUUID } from "crypto"
// Actions
import { getOrganizationKeyFromCookies } from "@/actions/organization"

const SESSION_ID_COOKIE = "maturoscope-session-id"

/**
 * Get or create a session ID cookie scoped to the current assessment.
 * A new session ID is generated when the user starts a new assessment,
 * and is cleared when the questionnaire is reset. This prevents duplicate
 * counting within the same assessment while allowing new assessments
 * to be counted independently.
 */
const getOrCreateSessionId = async (): Promise<string> => {
  const cookieStore = await cookies()
  const existing = cookieStore.get(SESSION_ID_COOKIE)?.value

  if (existing) return existing

  const sessionId = randomUUID()
  cookieStore.set(SESSION_ID_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
  })
  return sessionId
}

const trackStartedAssessment = async () => {
  const cookieStore = await cookies()
  const startedAssessment = cookieStore.get("started-assessment")?.value

  if (startedAssessment) {
    return { success: false, error: "Assessment already started" }
  }

  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const sessionId = await getOrCreateSessionId()

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-started?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-Session-Id": sessionId,
    },
  })

  cookieStore.set("started-assessment", "true")

  return response.json()
}

const trackCompletedAssessment = async () => {
  const cookieStore = await cookies()
  const completedAssessment = cookieStore.get("completed-assessment")?.value

  if (completedAssessment) {
    return { success: false, error: "Assessment already completed" }
  }

  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const sessionId = await getOrCreateSessionId()

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-completed?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-Session-Id": sessionId,
    },
  })

  cookieStore.set("completed-assessment", "true")

  return response.json()
}

const trackCompletedCategory = async (category: "TRL" | "MkRL" | "MfRL", level: number) => {
  const cookieStore = await cookies()
  const cookieKey = `tracked-category-${category}`
  const trackedCategory = cookieStore.get(cookieKey)?.value

  if (trackedCategory) {
    return { success: false, error: `Category ${category} already tracked` }
  }

  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const sessionId = await getOrCreateSessionId()

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-category?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
    body: JSON.stringify({
      category,
      level,
    }),
  })

  // Only set cookie if the API call succeeded so we can retry on next completion
  if (response.ok) {
    cookieStore.set(cookieKey, "true")
  }

  return response.json()
}

const clearAssessmentTracking = async () => {
  const cookieStore = await cookies()
  cookieStore.delete("started-assessment")
  cookieStore.delete("completed-assessment")
  cookieStore.delete("tracked-category-TRL")
  cookieStore.delete("tracked-category-MkRL")
  cookieStore.delete("tracked-category-MfRL")
  // Clear the session ID so a new one is generated for the next assessment.
  // This allows the same user to generate multiple reports, each counting
  // as a separate entry in statistics.
  cookieStore.delete(SESSION_ID_COOKIE)
}

export { trackStartedAssessment, trackCompletedAssessment, trackCompletedCategory, clearAssessmentTracking }