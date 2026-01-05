"use client"

// Packages
import { useState, useEffect, useCallback } from "react"
// Utils
import { cn } from "@/lib/utils"
// Components
import DetailedScale from "@/components/custom/ResultsPage/DetailedScale/DetailedScale"
// Types
import { Gap, DevelopmentPhase, RisksRecord } from "@/types/shared"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// API Client
import { getRisksApi } from "@/utils/apiClient"

export interface DetailedReportProps {
  title: string
  description: string
  copyPreLevel: string
  copyPostLevel: string
  copyHighestLevel: string
  copyLevelLabel: string
  serviceLabel: string
  comingSoonLabel: string
  focusLabel: string
  primaryRiskLabel: string
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

// localStorage stores DevelopmentPhase objects, not plain numbers
interface PhasesStorage {
  trl?: DevelopmentPhase
  mkrl?: DevelopmentPhase
  mfrl?: DevelopmentPhase
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
  copyHighestLevel,
  copyLevelLabel,
  serviceLabel,
  comingSoonLabel,
  focusLabel,
  primaryRiskLabel,
  className,
}: DetailedReportProps & ExtraProps) => {
  const [gapsData, setGapsData] = useState<GapsStorage>({})
  const [levelData, setLevelData] = useState<LevelStorage>({})
  const [risksData, setRisksData] = useState<RisksRecord | null>(null)

  const fetchRisks = useCallback(
    async (levels: LevelStorage, phases: PhasesStorage) => {
      const hasAllLevels =
        levels.trl !== undefined &&
        levels.mkrl !== undefined &&
        levels.mfrl !== undefined
      const hasAllPhases =
        phases.trl?.phase !== undefined &&
        phases.mkrl?.phase !== undefined &&
        phases.mfrl?.phase !== undefined

      if (!hasAllLevels || !hasAllPhases) return

      try {
        // Extract the phase number from each DevelopmentPhase object
        const result = await getRisksApi({
          levels: {
            trl: levels.trl as number,
            mkrl: levels.mkrl as number,
            mfrl: levels.mfrl as number,
          },
          phases: {
            trl: String(phases.trl!.phase),
            mkrl: String(phases.mkrl!.phase),
            mfrl: String(phases.mfrl!.phase),
          },
        })

        if (!result.success || !result.data) {
          console.error('Failed to fetch risks')
          return
        }

        const risks = result.data as RisksRecord

        setRisksData(risks)
      } catch (error) {
        console.error("Error fetching risks:", error)
      }
    },
    []
  )

  useEffect(() => {
    const storedGaps = localStorage.getItem("gaps")
    const storedLevel = localStorage.getItem("level")
    const storedPhases = localStorage.getItem("phases")

    if (storedGaps) setGapsData(JSON.parse(storedGaps))

    const parsedLevels: LevelStorage =
      storedLevel ? JSON.parse(storedLevel) : {}
    const parsedPhases: PhasesStorage =
      storedPhases ? JSON.parse(storedPhases) : {}

    if (storedLevel) setLevelData(parsedLevels)

    fetchRisks(parsedLevels, parsedPhases)
  }, [fetchRisks])

  return (
    <div
      className={cn("w-full flex flex-col gap-6 px-4 lg:px-6 mt-11", className)}
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-medium">{title}</h2>
        <p className="text-sm text-[#171717]">{description}</p>
      </div>

      {Object.entries(gapsData).map(([stageKey, gaps]) => {
        const riskData = risksData?.[stageKey as StageId]

        return (
          <DetailedScale
            id={stageKey}
            key={stageKey}
            title={KEY_TO_TITLE[stageKey]}
            level={levelData[stageKey as keyof LevelStorage] ?? 0}
            copyPreLevel={copyPreLevel}
            copyPostLevel={copyPostLevel}
            copyHighestLevel={copyHighestLevel}
            copyLevelLabel={copyLevelLabel}
            serviceLabel={serviceLabel}
            comingSoonLabel={comingSoonLabel}
            focusLabel={focusLabel}
            primaryRiskLabel={primaryRiskLabel}
            strategicFocus={riskData?.strategicFocus}
            primaryRisk={riskData?.primaryRisk}
            gaps={gaps ?? []}
          />
        )
      })}
    </div>
  )
}

export default DetailedReport
