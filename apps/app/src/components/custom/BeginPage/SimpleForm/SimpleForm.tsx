"use client"

// Packages
import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "motion/react"
// Components
import { Button } from "@/components/ui/button"
import LeaveQuestionnaireModal from "@/components/custom/FormPage/LeaveQuestionnaireModal/LeaveQuestionnaireModal"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"
// Animations
import { STAGGERED_LIST_ITEM_VARIANT, STAGGERED_LIST_VARIANT } from "@/animations/common"
// Types
import { LeaveQuestionnaireModalProps } from "@/components/custom/FormPage/LeaveQuestionnaireModal/LeaveQuestionnaireModal"
// Actions
import { clearAssessmentTracking } from "@/actions/tracking"

export interface SimpleFormProps {
  title: string
  label: string
  placeholder: string
  backButtonLabel: string
  nextButtonLabel: string
  loadingLabel?: string
  leaveQuestionnaireModal?: LeaveQuestionnaireModalProps
}

const SimpleForm = ({
  title,
  label,
  placeholder,
  backButtonLabel,
  nextButtonLabel,
  loadingLabel = "Loading...",
  leaveQuestionnaireModal,
}: SimpleFormProps) => {
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const isNextButtonDisabled = !projectName.trim() || isLoading
  const router = useRouter()
  const { lang } = useParams<{ lang: Locale }>()

  const handleBackButtonClick = () => {
    setIsLeaveModalOpen(true)
  }

  const handleLeaveConfirm = async () => {
    // Reset all form data
    await clearAssessmentTracking()
    localStorage.removeItem("form")
    localStorage.removeItem("gaps")
    localStorage.removeItem("level")
    localStorage.removeItem("phases")
    localStorage.removeItem("completedOn")
    localStorage.removeItem("organization-signature")
    localStorage.removeItem("report-pdf-cache")
    localStorage.removeItem("projectName")
    
    setIsLeaveModalOpen(false)
    router.push(`/${lang}/`)
  }

  const handleNextButtonClick = () => {
    setIsLoading(true)
    localStorage.setItem("projectName", projectName)
    // Add query param so form page knows we're coming from begin page
    router.push(`/${lang}/form?from=begin`)
  }

  useEffect(() => {
    const savedProjectName = localStorage.getItem("projectName")
    if (savedProjectName) setProjectName(savedProjectName)
  }, [])


  return (
    <motion.div
      variants={STAGGERED_LIST_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="h-full w-full max-w-[750px] flex flex-col px-4 lg:box-content">
      {leaveQuestionnaireModal && (
        <LeaveQuestionnaireModal
          {...leaveQuestionnaireModal}
          isOpen={isLeaveModalOpen}
          setIsOpen={setIsLeaveModalOpen}
          onResetClick={handleLeaveConfirm}
        />
      )}

      <div className="w-full h-full flex flex-col gap-4 justify-center">
        <motion.h1
          variants={STAGGERED_LIST_ITEM_VARIANT}
          className="text-3xl lg:text-4xl font-bold mb-2 text-foreground"
        >
          {title}
        </motion.h1>
        <motion.p
          variants={STAGGERED_LIST_ITEM_VARIANT}
          className="text-2xl text-foreground font-semibold"
        >
          {label}
        </motion.p>
        <motion.input
          variants={STAGGERED_LIST_ITEM_VARIANT}
          placeholder={placeholder}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          type="text"
          className="w-full h-9 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background data-placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        />
      </div>

      <motion.div
        variants={STAGGERED_LIST_ITEM_VARIANT}
        className="w-full mb-4 lg:mb-8 flex items-center justify-between gap-3">
        <Button variant="outline" size="lg" className="w-max" onClick={handleBackButtonClick}>
          <Image
            src="/icons/form/arrow-prev.svg"
            alt="Arrow Prev"
            width={16}
            height={16}
          />

          <span className="hidden lg:block">{backButtonLabel}</span>
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full lg:w-max"
          disabled={isNextButtonDisabled}
          onClick={handleNextButtonClick}
          accent
        >
          <span>{isLoading ? loadingLabel : nextButtonLabel}</span>
          {!isLoading && (
            <Image
              src="/icons/form/arrow-next.svg"
              alt="Arrow Next"
              width={16}
              height={16}
            />
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default SimpleForm
