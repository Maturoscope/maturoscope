"use client"

// Packages
import { useState, useEffect } from "react"
// Utils
import { cn } from "@/lib/utils"

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
    // Check if all levels are at maximum (9)
    const storedLevel = localStorage.getItem("level")
    if (storedLevel) {
      try {
        const levelData: LevelStorage = JSON.parse(storedLevel)
        const allAtMaxLevel = 
          levelData.trl === 9 && 
          levelData.mkrl === 9 && 
          levelData.mfrl === 9
        
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
