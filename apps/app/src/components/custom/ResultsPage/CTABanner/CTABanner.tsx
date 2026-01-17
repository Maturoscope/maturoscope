"use client"

// Packages
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
import ResetFormModal from "@/components/custom/ResultsPage/ResetFormModal/ResetFormModal"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
// Utils
import { cn } from "@/lib/utils"
// Icons
import { ResetIcon } from "@/components/icons"
// Types
import { ResetFormModalProps } from "@/components/custom/ResultsPage/ResetFormModal/ResetFormModal"
import { Locale } from "@/dictionaries/dictionaries"
import { Gap } from "@/actions/organization"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Actions
import { clearAssessmentTracking } from "@/actions/tracking"
// Hooks
import { useDownloadReport } from "@/hooks/useDownloadReport"

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

export interface CTABannerProps {
  title: string
  description: string
  or: string
  disclaimer: string
  talkButtonLabel: string
  resetButtonLabel: string
  resetFormModal: ResetFormModalProps
}

interface ExtraProps {
  className?: string
}

const CTABanner = ({
  title,
  description,
  or,
  disclaimer,
  talkButtonLabel,
  resetButtonLabel,
  resetFormModal,
  className,
}: CTABannerProps & ExtraProps) => {
  const [isResetFormModalOpen, setIsResetFormModalOpen] = useState(false)
  const [isTalkToExpertButtonDisabled, setIsTalkToExpertButtonDisabled] = useState<boolean>(false)
  const [isAllLevelsMax, setIsAllLevelsMax] = useState<boolean>(false)
  const router = useRouter()
  const params = useParams<{ lang?: Locale }>()
  const lang = params.lang || "en"
  const { downloadReport, isLoading } = useDownloadReport(lang)
  const { openModal } = useContactExpertContext()

  const handleResetForm = async () => {
    await clearAssessmentTracking()
    localStorage.removeItem("form")
    localStorage.removeItem("gaps")
    localStorage.removeItem("level")
    localStorage.removeItem("phases")
    localStorage.removeItem("completedOn")
    localStorage.removeItem("signature")
    localStorage.removeItem("projectName")
    localStorage.removeItem("contactRequestSuccess")
    setIsResetFormModalOpen(false)
  }

  const handleTalkButtonClick = () => openModal()

  const handleResetButtonClick = () => {
    handleResetForm()
    router.push(`/${lang}`)
  }

  const handleDownloadButtonClick = async () => {
    await downloadReport()
    router.push(`/${lang}`)
  }

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
    <div className="w-full flex flex-col items-center justify-center mt-11 px-4 lg:px-6 mb-8">
      <ResetFormModal
        {...resetFormModal}
        downloadIsLoading={isLoading}
        isOpen={isResetFormModalOpen}
        setIsOpen={setIsResetFormModalOpen}
        onDownloadClick={handleDownloadButtonClick}
        onResetClick={handleResetButtonClick}
      />

      {!isAllLevelsMax && (
        <>
          <div
            className={cn(
              "w-full flex items-center justify-center py-11 px-8 bg-accent rounded-xl",
              className
            )}
          >
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
              <h2 className="text-center lg:text-left text-4xl font-semibold text-neutral-50 mb-3">
                {title}
              </h2>
              <p className="text-center lg:text-left text-sm text-neutral-50 mb-8">
                {description}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleTalkButtonClick}
                  variant="outline"
                  disabled={isTalkToExpertButtonDisabled}
                >
                  {talkButtonLabel}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center flex-col">
            <div className="flex items-center justify-center gap-6 my-4 w-full">
              <div className="w-full h-px bg-border max-w-[340px]" />
              <span className="text-sm text-foreground/80">{or}</span>
              <div className="w-full h-px bg-border max-w-[340px]" />
            </div>
          </div>
        </>
      )}

      <Button
        onClick={() => setIsResetFormModalOpen(true)}
        variant="outline"
        icon={<ResetIcon />}
      >
        {resetButtonLabel}
      </Button>

      <p className="text-sm text-muted-foreground max-w-[825px] text-center mt-8">{disclaimer}</p>
    </div>
  )
}

export default CTABanner
