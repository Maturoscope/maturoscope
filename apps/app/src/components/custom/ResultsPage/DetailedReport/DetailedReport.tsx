"use client"

// Packages
import { useState, useEffect } from "react"
// Utils
import { cn } from "@/lib/utils"
// Components
import DetailedScale from "@/components/custom/ResultsPage/DetailedScale/DetailedScale"
// Types
import { Gap } from "@/actions/organization"

export interface DetailedReportProps {
  title: string
  description: string
  copyPreLevel: string
  copyPostLevel: string
  serviceLabel: string
  comingSoonLabel: string
}

interface ExtraProps {
  className?: string
}

interface GapsStorage {
  trl?: Gap[]
  mkrl?: Gap[]
  mfrl?: Gap[]
}

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

const KEY_TO_TITLE: Record<string, string> = {
  trl: "TRL",
  mkrl: "MkRL",
  mfrl: "MfRL",
}

const DetailedReport = ({
  title,
  description,
  copyPreLevel,
  copyPostLevel,
  serviceLabel,
  comingSoonLabel,
  className,
}: DetailedReportProps & ExtraProps) => {
  const [gapsData, setGapsData] = useState<GapsStorage>({})
  const [levelData, setLevelData] = useState<LevelStorage>({})

  useEffect(() => {
    const storedGaps = localStorage.getItem("gaps")
    const storedLevel = localStorage.getItem("level")

    if (storedGaps) setGapsData(JSON.parse(storedGaps))
    if (storedLevel) setLevelData(JSON.parse(storedLevel))
  }, [])

  return (
    <div
      className={cn("w-full flex flex-col gap-6 px-4 lg:px-6 mt-11", className)}
    >
      <div>
        <h2 className="text-2xl font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {Object.entries(gapsData).map(([stageKey, gaps]) => (
        <DetailedScale
          id={stageKey}
          key={stageKey}
          title={KEY_TO_TITLE[stageKey]}
          level={levelData[stageKey as keyof LevelStorage] ?? 0}
          copyPreLevel={copyPreLevel}
          copyPostLevel={copyPostLevel}
          serviceLabel={serviceLabel}
          comingSoonLabel={comingSoonLabel}
          gaps={gaps ?? []}
        />
      ))}
    </div>
  )
}

export default DetailedReport
