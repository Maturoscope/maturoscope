"use client"

// Packages
import { useState, useEffect, useCallback } from "react"
// Utils
import { cn } from "@/lib/utils"
// Components
import DetailedScale from "@/components/custom/ResultsPage/DetailedScale/DetailedScale"
// Types
import { Gap, DevelopmentPhase } from "@/actions/organization"
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { getRisks, RisksRecord } from "@/actions/questions"

export interface DetailedReportProps {
  title: string
  description: string
  copyPreLevel: string
  copyPostLevel: string
  copyHighestLevel: string
  copyLevelLabel: string
  serviceLabel: string
  servicesLabel: string
  comingSoonLabel: string
  gapLabel: string
  servicesColumnLabel: string
  descriptionColumnLabel: string
  focusLabel: string
  primaryRiskLabel: string
  noScoreTitle: string
  noScoreDescription: string
}

interface ExtraProps {
  className?: string
}

interface NotScoredStorage {
  trl?: boolean
  mkrl?: boolean
  mfrl?: boolean
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
  servicesLabel,
  comingSoonLabel,
  gapLabel,
  servicesColumnLabel,
  descriptionColumnLabel,
  focusLabel,
  primaryRiskLabel,
  noScoreTitle,
  noScoreDescription,
  className,
}: DetailedReportProps & ExtraProps) => {
  const [gapsData, setGapsData] = useState<GapsStorage>({})
  const [levelData, setLevelData] = useState<LevelStorage>({})
  const [notScoredData, setNotScoredData] = useState<NotScoredStorage>({})
  const [risksData, setRisksData] = useState<RisksRecord | null>(null)

  const fetchRisks = useCallback(
    async (levels: LevelStorage, phases: PhasesStorage) => {
      // Only consider the scales that were actually assessed (a scale has both
      // a level and a phase). This supports assessing 1, 2 or all 3 scales.
      const partialLevels: Partial<Record<StageId, number>> = {}
      const partialPhases: Partial<Record<StageId, number>> = {}

      ;(["trl", "mkrl", "mfrl"] as StageId[]).forEach((scale) => {
        const level = levels[scale]
        const phase = phases[scale]?.phase
        if (level !== undefined && phase !== undefined) {
          partialLevels[scale] = level
          partialPhases[scale] = phase
        }
      })

      if (Object.keys(partialLevels).length === 0) return

      try {
        const risks = await getRisks({
          levels: partialLevels,
          phases: partialPhases,
        })

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
    const storedNotScored = localStorage.getItem("notScored")

    if (storedGaps) setGapsData(JSON.parse(storedGaps))
    if (storedNotScored) setNotScoredData(JSON.parse(storedNotScored))

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
        <p className="text-base text-[#171717]">{description}</p>
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
            servicesLabel={servicesLabel}
            comingSoonLabel={comingSoonLabel}
            gapLabel={gapLabel}
            servicesColumnLabel={servicesColumnLabel}
            descriptionColumnLabel={descriptionColumnLabel}
            focusLabel={focusLabel}
            primaryRiskLabel={primaryRiskLabel}
            noScoreTitle={noScoreTitle}
            noScoreDescription={noScoreDescription}
            notScored={notScoredData[stageKey as keyof NotScoredStorage] ?? false}
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
