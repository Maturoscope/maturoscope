"use client"

// Packages
import { useParams } from "next/navigation"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { ModalStep } from "../ContactExpertModal"
// Hooks
import { useDownloadReport, buildScalePayload, type FormStorage, type LevelStorage, type PhasesStorage, type GapsStorage, type RisksStorage } from "@/hooks/useDownloadReport"
import { useCachedReport } from "@/hooks/useCachedReport"
// Actions
import { getQuestions, getRisks } from "@/actions/questions"
import { getOrganizationSignature } from "@/actions/organization"
import type { ReportPayload } from "@/actions/report"

export interface StatusProps {
  title: string
  description: string
  primaryButtonLabel: string
  secondaryButtonLabel: string
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  currentStep?: ModalStep
}

const EN_LOADING_BUTTON_LABEL = "Loading..."
const FR_LOADING_BUTTON_LABEL = "Chargement..."

const Status = ({
  isOpen,
  setIsOpen,
  title,
  description,
  primaryButtonLabel,
  secondaryButtonLabel,
  currentStep,
}: StatusProps & ExtraProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const { downloadReport, isLoading: isLoadingFallback } = useDownloadReport(lang)
  const { downloadCachedPdf, isDownloading } = useCachedReport()
  const loadingButtonLabel = lang === "en" ? EN_LOADING_BUTTON_LABEL : FR_LOADING_BUTTON_LABEL
  const isSuccess = currentStep === "successStatus"
  const isLoading = isLoadingFallback || isDownloading

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
      setIsOpen(false)
    } catch (error) {
      console.error('Error downloading cached PDF:', error)
      // Fallback to generating a new PDF using the old method
      await downloadReport()
      setIsOpen(false)
    }
  }

  const handlePrimaryButtonClick = () => {
    if (isSuccess) handleDownloadClick()
    else setIsOpen(false)
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} className="max-w-[512px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex justify-end w-full gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            {secondaryButtonLabel}
          </Button>
          <Button
            variant="default"
            onClick={handlePrimaryButtonClick}
            accent
            disabled={isLoading}
          >
            {isLoading ? loadingButtonLabel : primaryButtonLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default Status
