"use client"

// Packages
import { useEffect } from "react"
import { useRouter } from "next/navigation"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"
// Utils
import { ALL_SCALES, getSelectedScales } from "@/lib/selectedScales"

interface ReviewStageGuardProps {
  stage: string
  lang: Locale
}

/**
 * Guards the review routes: if the stage in the URL is not a valid scale, or is
 * a scale the user did not choose to assess, send them back to the start of the
 * flow (an unselected scale has no answers to review).
 */
const ReviewStageGuard = ({ stage, lang }: ReviewStageGuardProps) => {
  const router = useRouter()

  useEffect(() => {
    const isValidStage = ALL_SCALES.includes(stage as StageId)
    const isSelected = getSelectedScales().includes(stage as StageId)

    if (!isValidStage || !isSelected) {
      router.replace(`/${lang}`)
    }
  }, [stage, lang, router])

  return null
}

export default ReviewStageGuard
