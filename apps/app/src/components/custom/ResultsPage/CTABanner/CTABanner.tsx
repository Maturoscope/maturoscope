"use client"

// Packages
import { useState } from "react"
import { useRouter } from "next/navigation"
// Utils
import { cn } from "@/lib/utils"
// Icons
import { ResetIcon } from "@/components/icons"
// Types
import { ResetFormModalProps } from "@/components/custom/ResultsPage/ResetFormModal/ResetFormModal"
// Components
import { Button } from "@/components/ui/button"
import ResetFormModal from "@/components/custom/ResultsPage/ResetFormModal/ResetFormModal"

export interface CTABannerProps {
  title: string
  description: string
  or: string
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
  talkButtonLabel,
  resetButtonLabel,
  resetFormModal,
  className,
}: CTABannerProps & ExtraProps) => {
  const [isResetFormModalOpen, setIsResetFormModalOpen] = useState(false)
  const router = useRouter()

  const handleResetForm = () => {
    localStorage.removeItem("form")
    localStorage.removeItem("gaps")
    localStorage.removeItem("level")
    localStorage.removeItem("phases")
    setIsResetFormModalOpen(false)
  }

  const handleTalkButtonClick = () => {
    console.log("talk button clicked")
  }

  const handleResetButtonClick = () => {
    handleResetForm()
    router.push("/")
  }

  const handleDownloadButtonClick = () => {
    console.log("download button clicked")
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mt-11 px-4 lg:px-6 mb-8">
      <ResetFormModal
        {...resetFormModal}
        isOpen={isResetFormModalOpen}
        setIsOpen={setIsResetFormModalOpen}
        onDownloadClick={handleDownloadButtonClick}
        onResetClick={handleResetButtonClick}
      />

      <div
        className={cn(
          "w-full flex items-center justify-center py-11 px-8 bg-accent rounded-xl",
          className
        )}
      >
        <div className="w-full max-w-2xl flex flex-col items-center justify-center">
          <h2 className="text-4xl font-semibold text-neutral-50 mb-3">
            {title}
          </h2>
          <p className="text-sm text-neutral-50 mb-8">{description}</p>
          <div className="flex gap-2">
            <Button onClick={handleTalkButtonClick} variant="outline">
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
        <Button
          onClick={() => setIsResetFormModalOpen(true)}
          variant="outline"
          icon={<ResetIcon />}
        >
          {resetButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default CTABanner
