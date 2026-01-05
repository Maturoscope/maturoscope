"use client"

import { useEffect } from "react"
import { trackCompletedAssessmentApi } from "@/utils/apiClient"

const TrackCompletedAssessment = () => {
  useEffect(() => {
    // Track completed assessment using API Route
    trackCompletedAssessmentApi().catch((error) => {
      // Silently fail for tracking - don't interrupt user experience
      console.warn("Error tracking completed assessment:", error)
    })
  }, [])

  return null
}

export default TrackCompletedAssessment

