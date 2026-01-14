"use client"

// Packages
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
// Utils
import { cn } from "@/lib/utils"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { Gap } from "@/actions/organization"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Hooks
import { useDownloadReport, buildScalePayload, type FormStorage, type LevelStorage, type PhasesStorage, type GapsStorage, type RisksStorage } from "@/hooks/useDownloadReport"
import { useCachedReport } from "@/hooks/useCachedReport"
// Actions
import { getQuestions, getRisks } from "@/actions/questions"
import { getOrganizationSignature } from "@/actions/organization"
import type { ReportPayload } from "@/actions/report"

export interface ResultsTopBarProps {
  title: string
  subtitle: string
  downloadButtonLabel: string
  talkButtonLabel: string
  lang: Locale
}

interface ExtraProps {
  className?: string
}

const ResultsTopBar = ({
  title,
  subtitle,
  downloadButtonLabel,
  talkButtonLabel,
  lang,
  className,
}: ResultsTopBarProps & ExtraProps) => {
  const [completedOnDate, setCompletedOnDate] = useState<string>("")
  const [isTalkToExpertButtonDisabled, setIsTalkToExpertButtonDisabled] = useState<boolean>(false)
  const [isAllLevelsMax, setIsAllLevelsMax] = useState<boolean>(false)
  const { openModal } = useContactExpertContext()
  const { downloadReport, isLoading } = useDownloadReport(lang)
  const { downloadCachedPdf, isDownloading } = useCachedReport()
  const pathname = usePathname()
  const isResultsPage = pathname.includes("/results")

  const handleTalkButtonClick = () => openModal()

  /**
   * Build the report payload from localStorage
   */
  const buildPayloadFromStorage = async (): Promise<ReportPayload> => {
    // Get questions data with translated text
    const questionsData = await getQuestions(lang)

    // Read data from localStorage
    const formData: FormStorage = JSON.parse(
      localStorage.getItem("form") || "{}"
    )
    const levelData: LevelStorage = JSON.parse(
      localStorage.getItem("level") || "{}"
    )
    const phasesData: PhasesStorage = JSON.parse(
      localStorage.getItem("phases") || "{}"
    )
    const gapsData: GapsStorage = JSON.parse(
      localStorage.getItem("gaps") || "{}"
    )

    // Fetch risks data using getRisks
    let risksData: RisksStorage | null = null
    const hasAllLevels =
      levelData.trl !== undefined &&
      levelData.mkrl !== undefined &&
      levelData.mfrl !== undefined
    const hasAllPhases =
      phasesData.trl?.phase !== undefined &&
      phasesData.mkrl?.phase !== undefined &&
      phasesData.mfrl?.phase !== undefined

    if (hasAllLevels && hasAllPhases) {
      risksData = await getRisks({
        levels: {
          trl: levelData.trl as number,
          mkrl: levelData.mkrl as number,
          mfrl: levelData.mfrl as number,
        },
        phases: {
          trl: phasesData.trl!.phase,
          mkrl: phasesData.mkrl!.phase,
          mfrl: phasesData.mfrl!.phase,
        },
      })
    }

    // Get completion date from localStorage or use current date
    const storedCompletedOn = localStorage.getItem("completedOn")
    const completedOnDate =
      storedCompletedOn ? new Date(storedCompletedOn) : new Date()

    // Format date based on locale
    const completedOn = completedOnDate.toLocaleDateString(
      lang === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    )

    // Get projectName from localStorage
    const projectName = localStorage.getItem("projectName") || undefined

    // Get signature from localStorage or fetch it
    let signature = localStorage.getItem("signature")
    if (!signature) {
      signature = await getOrganizationSignature()
      if (signature) {
        localStorage.setItem("signature", signature)
      }
    }
    const signatureUrl = signature || undefined

    // Build the payload
    return {
      completedOn,
      projectName,
      signature: signatureUrl,
      trl: buildScalePayload(
        "trl",
        lang,
        questionsData,
        formData,
        levelData,
        phasesData,
        gapsData,
        risksData
      ),
      mkrl: buildScalePayload(
        "mkrl",
        lang,
        questionsData,
        formData,
        levelData,
        phasesData,
        gapsData,
        risksData
      ),
      mfrl: buildScalePayload(
        "mfrl",
        lang,
        questionsData,
        formData,
        levelData,
        phasesData,
        gapsData,
        risksData
      ),
    }
  }

  const handleDownloadClick = async () => {
    try {
      // Build payload for potential regeneration
      const payload = await buildPayloadFromStorage()
      
      // Try to download cached PDF, with auto-regeneration if expired
      await downloadCachedPdf({
        payload,
        lang,
      })
    } catch (error) {
      console.error('Error downloading cached PDF:', error)
      // Fallback to generating a new PDF using the old method
      await downloadReport()
    }
  }

  useEffect(() => {
    const storedCompletedOn = localStorage.getItem("completedOn")
    if (storedCompletedOn) {
      const date = new Date(storedCompletedOn)
      const formattedDate = date.toLocaleDateString(
        lang === "fr" ? "fr-FR" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
      setCompletedOnDate(formattedDate)
    }
  }, [lang])

  useEffect(() => {
    const storedGaps = localStorage.getItem("gaps")
    const storedLevel = localStorage.getItem("level")
    
    // Check if all levels are at maximum (9)
    if (storedLevel) {
      try {
        const levelData: LevelStorage = JSON.parse(storedLevel)
        const allAtMaxLevel = 
          levelData.trl === 9 && 
          levelData.mkrl === 9 && 
          levelData.mfrl === 9
        setIsAllLevelsMax(allAtMaxLevel)
      } catch (error) {
        console.error("Error parsing level data:", error)
        setIsAllLevelsMax(false)
      }
    }
    
    if (storedGaps) {
      try {
        const gaps = JSON.parse(storedGaps) as Partial<Record<StageId, Gap[]>>
        // Check if there's at least one gap with hasServices: true across all categories
        const hasAnyService = Object.values(gaps).some((categoryGaps: Gap[] | undefined) => {
          if (Array.isArray(categoryGaps)) {
            return categoryGaps.some((gap: Gap) => gap.hasServices === true)
          }
          return false
        })
        // Disable button if no gaps have services
        setIsTalkToExpertButtonDisabled(!hasAnyService)
      } catch (error) {
        console.error("Error parsing gaps from localStorage:", error)
        // On error, disable the button to be safe
        setIsTalkToExpertButtonDisabled(true)
      }
    } else {
      // If no gaps data, disable the button
      setIsTalkToExpertButtonDisabled(true)
    }
  }, [])

  return (
    <div
      className={cn(
        "w-full flex items-center flex-wrap gap-y-4 justify-between p-4 lg:px-6 py-4 bg-white border-b border-border",
        isResultsPage && "fixed top-14 left-0 right-0 z-40 bg-white",
        className
      )}
    >
      <div className="flex flex-col items-start justify-start">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {subtitle}
          {completedOnDate}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleDownloadClick}
          disabled={isLoading || isDownloading}
        >
          {(isLoading || isDownloading) ? "Loading..." : downloadButtonLabel}
        </Button>
        {!isAllLevelsMax && (
          <Button
            variant="default"
            accent
            onClick={handleTalkButtonClick}
            disabled={isTalkToExpertButtonDisabled}
          >
            {talkButtonLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ResultsTopBar
