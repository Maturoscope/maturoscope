"use client"

// Packages
import { useState, useEffect } from "react"
// Utils
import { cn } from "@/lib/utils"
// Icons
import {
  ArrowNextIcon,
  CriteriaMfrlIcon,
  CriteriaMkrlIcon,
  CriteriaTrlIcon,
} from "@/components/icons"
// Components
import { Button } from "@/components/ui/button"
import OverviewCard from "@/components/custom/ResultsPage/OverviewCard/OverviewCard"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { DevelopmentPhase } from "@/actions/organization"

export interface OverviewProps {
  title: string
  stages: {
    label: string
    description: string
  }[]
  learnMoreButtonLabel: string
  resultsSufixLabel: string
}

interface ExtraProps {
  className?: string
}

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

interface PhasesStorage {
  trl?: DevelopmentPhase
  mkrl?: DevelopmentPhase
  mfrl?: DevelopmentPhase
}

const LABEL_TO_KEY: Record<string, StageId> = {
  TRL: "trl",
  MkRL: "mkrl",
  MfRL: "mfrl",
}

const ICON_TO_KEY: Record<string, React.ReactNode> = {
  TRL: <CriteriaTrlIcon width={16} height={16} />,
  MkRL: <CriteriaMkrlIcon width={16} height={16} />,
  MfRL: <CriteriaMfrlIcon width={16} height={16} />,
}

const Overview = ({
  title,
  learnMoreButtonLabel,
  resultsSufixLabel,
  stages,
  className,
}: OverviewProps & ExtraProps) => {
  const [levelData, setLevelData] = useState<LevelStorage>({})
  const [phasesData, setPhasesData] = useState<PhasesStorage>({})

  useEffect(() => {
    const storedLevel = localStorage.getItem("level")
    const storedPhases = localStorage.getItem("phases")

    if (storedLevel) setLevelData(JSON.parse(storedLevel))
    if (storedPhases) setPhasesData(JSON.parse(storedPhases))
  }, [])

  const formattedStages = stages.map((stage) => {
    const stageKey = LABEL_TO_KEY[stage.label]
    const icon = ICON_TO_KEY[stage.label]
    const value = levelData[stageKey] ?? 0
    const maxValue = 9
    const phase = phasesData[stageKey] as DevelopmentPhase

    return {
      ...stage,
      value,
      maxValue,
      learnMoreButtonLabel,
      resultsSufixLabel,
      icon,
      phase,
    }
  })

  return (
    <div
      className={cn(
        "flex flex-col w-full px-4 lg:px-6 mt-3 lg:mt-8",
        className
      )}
    >
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-medium">{title}</h1>
        <div className="flex md:hidden gap-2.5">
          <Button variant="outline" className="px-2">
            <ArrowNextIcon className="rotate-180" />
          </Button>
          <Button variant="outline" className="px-2">
            <ArrowNextIcon />
          </Button>
        </div>
      </div>

      <div className="w-full gap-6 mt-4 hidden lg:flex">
        {formattedStages.map((stage) => (
          <OverviewCard key={stage.label} {...stage} />
        ))}
      </div>
    </div>
  )
}

export default Overview
