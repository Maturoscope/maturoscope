"use server"

// Packages
import { cookies } from "next/headers"
// Actions
import { getOrganizationKeyFromCookies } from "@/actions/organization"

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

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-started?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
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

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-completed?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
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

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-category?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category,
      level,
    }),
  })

  cookieStore.set(cookieKey, "true")

  return response.json()
}

const clearAssessmentTracking = async () => {
  const cookieStore = await cookies()
  cookieStore.delete("started-assessment")
  cookieStore.delete("completed-assessment")
}

export { trackStartedAssessment, trackCompletedAssessment, trackCompletedCategory, clearAssessmentTracking }