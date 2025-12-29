"use client"

import { useEffect } from "react"
import { trackCompletedAssessment } from "@/actions/tracking"

const TrackCompletedAssessment = () => {
  useEffect(() => {
    trackCompletedAssessment()
  }, [])

  return null
}

export default TrackCompletedAssessment

