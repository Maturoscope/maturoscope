"use client"

// Packages
import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { usePathname, useRouter, useParams } from "next/navigation"
// Components
import LanguageSelect from "@/components/common/LanguageSelect/LanguageSelect"
import ResetFormModal from "@/components/custom/ResultsPage/ResetFormModal/ResetFormModal"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"
// Actions
import { clearAssessmentTracking } from "@/actions/tracking"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { ResetFormModalProps } from "@/components/custom/ResultsPage/ResetFormModal/ResetFormModal"
// Hooks
import { useDownloadReport } from "@/hooks/useDownloadReport"

export interface HeaderProps {
  stringConnector: string
  resetFormModal?: ResetFormModalProps
}

interface ExtraProps {
  showBackButton?: boolean
}

const Header = ({
  stringConnector,
  showBackButton = false,
  resetFormModal,
}: HeaderProps & ExtraProps) => {
  const [isResetFormModalOpen, setIsResetFormModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang?: Locale }>()
  const lang = params.lang || "en"
  const { downloadReport, isLoading } = useDownloadReport(lang)

  const isResultsPage = pathname.includes("/results")

  const handleBackButtonClick = () => {
    if (isResultsPage) setIsResetFormModalOpen(true)
    else router.push("/")
  }

  const handleResetForm = async () => {
    await clearAssessmentTracking()
    localStorage.removeItem("form")
    localStorage.removeItem("gaps")
    localStorage.removeItem("level")
    localStorage.removeItem("phases")
    localStorage.removeItem("completedOn")
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
      className="w-full pl-0.5 pr-4 lg:pl-2 lg:pr-6 h-14 flex items-center justify-between bg-white border border-b border-border shadow-sm shrink-0"
    >
      <div className="flex items-center gap-2">
        {showBackButton && (
          <>
            {resetFormModal && (
              <ResetFormModal
                {...resetFormModal}
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

          <Image
            src="/icons/nobatek.svg"
            alt="Nobatek"
            width={64}
            height={20}
          />
        </div>
      </div>
      <LanguageSelect />
    </motion.header>
  )
}

export default Header
