"use client"

// Packages
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { usePathname, useRouter, useParams } from "next/navigation"
// Components
import LanguageSelect from "@/components/common/LanguageSelect/LanguageSelect"
import BeforeYouGoModal from "@/components/custom/ResultsPage/BeforeYouGoModal/BeforeYouGoModal"
import LeaveQuestionnaireModal from "@/components/custom/FormPage/LeaveQuestionnaireModal/LeaveQuestionnaireModal"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"
// Actions
import { clearAssessmentTracking } from "@/actions/tracking"
import { getOrganizationSignature } from "@/actions/organization"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { BeforeYouGoModalProps } from "@/components/custom/ResultsPage/BeforeYouGoModal/BeforeYouGoModal"
import { LeaveQuestionnaireModalProps } from "@/components/custom/FormPage/LeaveQuestionnaireModal/LeaveQuestionnaireModal"
// Hooks
import { useDownloadReport } from "@/hooks/useDownloadReport"

export interface HeaderProps {
  stringConnector: string
  beforeYouGoModal?: BeforeYouGoModalProps
  leaveQuestionnaireModal?: LeaveQuestionnaireModalProps
}

interface ExtraProps {
  showBackButton?: boolean
}

const Header = ({
  stringConnector,
  showBackButton = false,
  beforeYouGoModal,
  leaveQuestionnaireModal,
}: HeaderProps & ExtraProps) => {
  const [isResetFormModalOpen, setIsResetFormModalOpen] = useState(false)
  const [isLeaveQuestionnaireModalOpen, setIsLeaveQuestionnaireModalOpen] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang?: Locale }>()
  const lang = params.lang || "en"
  const { downloadReport, isLoading } = useDownloadReport(lang)

  useEffect(() => {
    // Try to get signature from localStorage first
    const storedSignature = localStorage.getItem("signature")
    if (storedSignature) {
      setSignature(storedSignature)
    } else {
      // If not in localStorage, fetch it
      getOrganizationSignature().then((sig) => {
        if (sig) {
          localStorage.setItem("signature", sig)
          setSignature(sig)
        }
      })
    }
  }, [])

  const isResultsPage = pathname.includes("/results")

  const handleBackButtonClick = () => {
    if (isResultsPage) setIsResetFormModalOpen(true)
    else setIsLeaveQuestionnaireModalOpen(true)
  }

  const handleResetForm = async () => {
    await clearAssessmentTracking()
    localStorage.removeItem("form")
    localStorage.removeItem("gaps")
    localStorage.removeItem("level")
    localStorage.removeItem("phases")
    localStorage.removeItem("completedOn")
    localStorage.removeItem("signature")
    localStorage.removeItem("projectName")
    setIsResetFormModalOpen(false)
  }

  const handleResetButtonClick = () => {
    handleResetForm()
    router.push("/")
  }

  const handleDownloadButtonClick = async () => {
    await downloadReport()
    handleResetForm()
    router.push("/")
  }

  return (
    <motion.header
      variants={SIMPLE_FADE_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="z-50 w-full pl-0.5 pr-4 lg:pl-2 lg:pr-6 h-14 flex items-center justify-between bg-white border border-b border-border shadow-sm shrink-0"
    >
      <div className="flex items-center gap-2">
        {showBackButton && (
          <>
            {leaveQuestionnaireModal && (
              <LeaveQuestionnaireModal
                {...leaveQuestionnaireModal}
                isOpen={isLeaveQuestionnaireModalOpen}
                setIsOpen={setIsLeaveQuestionnaireModalOpen}
                onResetClick={handleResetButtonClick}
              />
            )}
            {beforeYouGoModal && (
              <BeforeYouGoModal
                {...beforeYouGoModal}
                downloadIsLoading={isLoading}
                isOpen={isResetFormModalOpen}
                setIsOpen={setIsResetFormModalOpen}
                onDownloadClick={handleDownloadButtonClick}
                onResetClick={handleResetButtonClick}
              />
            )}
            <button
              className="w-9 h-9 cursor-pointer flex items-center justify-center"
              onClick={handleBackButtonClick}
            >
              <Image
                src="/icons/chevron-down.svg"
                alt="Back"
                width={16}
                height={16}
                className="rotate-90"
              />
            </button>
            <div className="w-px h-9 bg-border" />
          </>
        )}
        <div className="flex items-center gap-2 text-foreground">
          <div className="ml-4">
            <Image
              src="/icons/maturoscope-desktop.svg"
              alt="Maturoscope"
              width={121}
              height={20}
              className="hidden lg:block"
            />
            <Image
              src="/icons/maturoscope-mobile.svg"
              alt="Maturoscope"
              width={20}
              height={14}
              className="block lg:hidden"
            />
          </div>

          <span className="text-sm font-medium">{stringConnector}</span>

          {signature ? (
            <Image
              src={signature}
              alt="Signature"
              width={64}
              height={20}
            />
          ) : (
            <Image
              src="/icons/nobatek.svg"
              alt="Nobatek"
              width={64}
              height={20}
            />
          )}
        </div>
      </div>
      <LanguageSelect />
    </motion.header>
  )
}

export default Header
