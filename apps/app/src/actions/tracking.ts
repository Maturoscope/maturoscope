import { getOrganizationKeyFromCookies } from "./organization"

const trackStartedAssessment = async () => {
  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-started?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
  })

  return response.json()
}

const trackCompletedAssessment = async () => {
  const organizationKey = await getOrganizationKeyFromCookies()

  if (!organizationKey) {
    return { success: false, error: "Organization key not found" }
  }

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-completed?organizationKey=${organizationKey}`
  const response = await fetch(endpoint, {
    method: "POST",
  })
  return response.json()
}

export { trackStartedAssessment, trackCompletedAssessment }