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
import { useDownloadReport } from "@/hooks/useDownloadReport"

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

const LOADING_BUTTON_LABEL_BY_LANG: Record<string, string> = {
  en: "Loading...",
  fr: "Chargement...",
  es: "Cargando...",
  it: "Caricamento...",
  sl: "Nalaganje...",
  el: "Φόρτωση...",
}

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
  const { downloadReport, isLoading } = useDownloadReport(lang)
  const loadingButtonLabel = LOADING_BUTTON_LABEL_BY_LANG[lang] ?? LOADING_BUTTON_LABEL_BY_LANG.en
  const isSuccess = currentStep === "successStatus"

  const handleDownloadClick = async () => {
    await downloadReport()
    setIsOpen(false)
  }

  const handlePrimaryButtonClick = () => {
    if (isSuccess) handleDownloadClick()
    else setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      closeOnOverlayClick={false}
      className="max-w-[512px]"
    >
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
