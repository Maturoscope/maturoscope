"use client"

// Packages
import { useState, useEffect } from "react"
// Utils
import { cn } from "@/lib/utils"
import { getSelectedScales } from "@/lib/selectedScales"
import { areAllScalesNotScored } from "@/lib/notApplicable"

export interface UnlockNextLevelProps {
  title: string
  steps: string[]
  clarification: string
}

interface ExtraProps {
  className?: string
}

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

const UnlockNextLevel = ({
  title,
  steps,
  clarification,
  className,
}: UnlockNextLevelProps & ExtraProps) => {
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    // Hidden when there is nothing to act on: either everything is maxed out,
    // or every assessed scale was marked Not Applicable (no gaps/services).
    if (areAllScalesNotScored()) {
      setShouldShow(false)
      return
    }

    // Check if all ASSESSED levels are at maximum (9). Only the scales the
    // user chose to assess are considered.
    const storedLevel = localStorage.getItem("level")
    if (storedLevel) {
      try {
        const levelData: LevelStorage = JSON.parse(storedLevel)
        const selectedScales = getSelectedScales()
        const allAtMaxLevel = selectedScales.every(
          (scale) => levelData[scale] === 9
        )

        setShouldShow(!allAtMaxLevel)
      } catch (error) {
        console.error("Error parsing level data:", error)
        // On error, show the component to be safe
        setShouldShow(true)
      }
    }
  }, [])

  if (!shouldShow) {
    return null
  }

  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      <div className="w-full mx-4 lg:mx-6 px-5 py-6 lg:p-8 bg-[#E7E6E4]/50 rounded-xl mt-11 flex flex-col gap-6">
        <h2 className="text-2xl font-medium">{title}</h2>

        <ol className="flex flex-col items-start justify-start list-none">
          {steps.map((step, index) => (
            <li key={step} className="text-base text-foreground/80 flex items-start justify-start gap-1">
              <div className="w-[15px] shrink-0">
                {index + 1}.
              </div>
              {step}
            </li>
          ))}
        </ol>

        <p className="text-base text-foreground/80">{clarification}</p>
      </div>
    </div>
  )
}

export default UnlockNextLevel
