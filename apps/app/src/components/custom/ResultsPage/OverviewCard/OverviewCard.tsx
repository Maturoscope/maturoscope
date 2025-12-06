"use client"

// Types
import { DevelopmentPhase } from "@/actions/organization"
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
}: OverviewCardProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const phaseName = phase?.phaseName?.[lang]
  const focusGoal = phase?.focusGoal?.[lang]

  return (
    <div className="w-full flex flex-col bg-white rounded-2xl">
      <div className="w-full flex justify-between items-center px-3 h-11 border-b border-border">
        <div className="flex items-center gap-1.5">
          {icon}
          <h2 className="text-sm text-muted-foreground">
            {label} {resultsSufixLabel}
          </h2>
        </div>
        <span className="underline cursor-pointer">{learnMoreButtonLabel}</span>
      </div>

      <div className="w-full flex flex-col items-center gap-6 pb-9 p-6 lg:pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xl font-semibold text-center">{label}</span>
          <span className="text-sm text-muted-foreground text-center">
            {description}
          </span>
        </div>
        <div>
          <span>{value}</span>
          <span>/</span>
          <span>{maxValue}</span>
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
