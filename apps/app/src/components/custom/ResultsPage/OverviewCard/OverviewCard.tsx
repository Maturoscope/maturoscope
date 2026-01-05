"use client"

// Styles
import "react-circular-progressbar/dist/styles.css"
// Packages
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
// Types
import { DevelopmentPhase } from "@/types/shared"
// Packages
import { useParams } from "next/navigation"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"

interface OverviewCardProps {
  label: string
  description: string
  learnMoreButtonLabel: string
  resultsSufixLabel: string
  value: number
  maxValue: number
  phase: DevelopmentPhase
  icon: React.ReactNode
  stageKey?: string
}

const COLOR_TO_KEY: Record<string, string> = {
  TRL: "#EA580C",
  MkRL: "#0D9488",
  MfRL: "#2563EB",
}

const OverviewCard = ({
  label,
  description,
  learnMoreButtonLabel,
  resultsSufixLabel,
  value,
  maxValue,
  phase,
  icon,
  stageKey,
}: OverviewCardProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const phaseName = phase?.phaseName?.[lang]
  const focusGoal = phase?.focusGoal?.[lang]

  const handleLearnMoreClick = () => {
    if (stageKey) {
      const targetElement = document.getElementById(`scale-${stageKey}`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <div className="w-full flex flex-col bg-white rounded-2xl shadow-xs">
      <div className="w-full flex justify-between items-center px-3 h-11 border-b border-border">
        <div className="flex items-center gap-1.5">
          {icon}
          <h2 className="text-sm text-muted-foreground">
            {label} {resultsSufixLabel}
          </h2>
        </div>
        <span className="underline cursor-pointer" onClick={handleLearnMoreClick}>
          {learnMoreButtonLabel}
        </span>
      </div>

      <div className="w-full flex flex-col items-center gap-6 pb-9 p-6 lg:pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xl font-semibold text-center">{label}</span>
          <span className="text-sm text-muted-foreground text-center">
            {description}
          </span>
        </div>
        <div className="aspect-square w-[140px] h-auto md:w-[155px] lg:w-[170px]">
          <CircularProgressbarWithChildren
            value={value}
            maxValue={maxValue}
            strokeWidth={6}
            styles={{
              path: {
                stroke: COLOR_TO_KEY[label],
              },
              trail: {
                stroke: "#F5F5F5",
              },
            }}
          >
            <div className="flex items-end">
              <span className="text-5xl font-medium text-center leading-[0.88]">
                {value}
              </span>
              <span className="text-sm text-muted-foreground">/{maxValue}</span>
            </div>
          </CircularProgressbarWithChildren>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-center">{phaseName}</span>
          <span className="text-sm text-muted-foreground text-center">
            {focusGoal}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OverviewCard
