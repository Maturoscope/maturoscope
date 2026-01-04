"use client"

import { useEffect } from "react"
import { trackCompletedAssessment } from "@/actions/tracking"
import { withServerActionRetry } from "@/utils/serverActionRetry"

const TrackCompletedAssessment = () => {
  useEffect(() => {
    // Use retry wrapper to handle Server Action errors
    withServerActionRetry(
      () => trackCompletedAssessment(),
      1, // Max 1 retry for tracking (less critical)
      500 // 500ms delay
    ).catch((error) => {
      // Silently fail for tracking - don't interrupt user experience
      if (error instanceof Error && error.message.includes("Failed to find Server Action")) {
        console.warn("Server Action error in tracking - will retry on next page load")
      }
    })
  }, [])

  return null
}

export default TrackCompletedAssessment

