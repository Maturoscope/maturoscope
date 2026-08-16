"use client"

// Packages
import { useState, useEffect } from "react"
import Image from "next/image"
import { usePathname, useRouter, useParams } from "next/navigation"
// Utils
import { cn } from "@/lib/utils"
// Components
import LanguageSelect from "@/components/common/LanguageSelect/LanguageSelect"
import BeforeYouGoModal from "@/components/custom/ResultsPage/BeforeYouGoModal/BeforeYouGoModal"
import LeaveQuestionnaireModal from "@/components/custom/FormPage/LeaveQuestionnaireModal/LeaveQuestionnaireModal"
// Actions
import { clearAssessmentTracking } from "@/actions/tracking"
import { getOrganizationSignature, getOrganizationUrl } from "@/actions/organization"
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

const Header = ({
  stringConnector,
  beforeYouGoModal,
  leaveQuestionnaireModal,
}: HeaderProps) => {
  const [isResetFormModalOpen, setIsResetFormModalOpen] = useState(false)
  const [isLeaveQuestionnaireModalOpen, setIsLeaveQuestionnaireModalOpen] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang?: Locale }>()
  const lang = params.lang || "en"
  const { downloadReport, isLoading } = useDownloadReport(lang)

  useEffect(() => {
    const SIGNATURE_STORAGE_KEY = "organization-signature"

    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null
      }
      return null
    }

    const loadSignature = async () => {
      const organizationKey = getCookie("organization-key")

      if (!organizationKey) {
        setSignature(null)
        return
      }

      try {
        const stored = localStorage.getItem(SIGNATURE_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as {
            organizationKey: string
            url: string
          }

          if (parsed.organizationKey === organizationKey && parsed.url) {
            setSignature(parsed.url)
            return
          }
        }
      } catch (error) {
        console.error("Error reading organization signature from localStorage:", error)
      }

      const sig = await getOrganizationSignature()
      if (sig) {
        const payload = JSON.stringify({
          organizationKey,
          url: sig,
        })
        localStorage.setItem(SIGNATURE_STORAGE_KEY, payload)
        setSignature(sig)
      } else {
        localStorage.removeItem(SIGNATURE_STORAGE_KEY)
        setSignature(null)
      }
    }

    loadSignature()
  }, [])

  useEffect(() => {
    const loadLogoUrl = async () => {
      const orgUrl = await getOrganizationUrl()
      setLogoUrl(orgUrl)
    }

    loadLogoUrl()
  }, [])

  const isResultsPage = pathname.includes("/results")
  // The "before we begin" screen is pre-assessment: back just returns to the
  // landing page, no leave/reset modal needed.
  const isBeforeWeBegin = pathname.includes("/before-we-begin")
  // The back button (and its leave/before-you-go modals) only apply to the
  // assessment flow. Derived from the route so the Header can live in the
  // persistent layout instead of remounting on every page.
  const showBackButton =
    isBeforeWeBegin || /\/(begin|form|review|results)(\/|$)/.test(pathname)

  const handleBackButtonClick = () => {
    if (isBeforeWeBegin) router.push(`/${lang}`)
    else if (isResultsPage) setIsResetFormModalOpen(true)
    else setIsLeaveQuestionnaireModalOpen(true)
  }

  const handleResetForm = async () => {
    await clearAssessmentTracking()
    localStorage.removeItem("form")
    localStorage.removeItem("gaps")
    localStorage.removeItem("level")
    localStorage.removeItem("phases")
    localStorage.removeItem("completedOn")
    localStorage.removeItem("organization-signature")
    localStorage.removeItem("report-pdf-cache")
    localStorage.removeItem("risks")
    localStorage.removeItem("projectName")
    localStorage.removeItem("selectedScales")
    setIsResetFormModalOpen(false)
  }

  const handleResetButtonClick = () => {
    handleResetForm()
    router.push(`/${lang}`)
  }

  const handleDownloadButtonClick = async () => {
    await downloadReport()
    handleResetForm()
    router.push(`/${lang}`)
  }

  return (
    <header
      className={cn(
        "reveal-fade z-50 w-full pl-0.5 pr-4 lg:pl-2 lg:pr-6 h-14 flex items-center justify-between bg-white border border-b border-border shadow-sm shrink-0",
        isResultsPage && "fixed top-0 left-0 right-0 bg-white"
      )}
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


          {signature && (
            <>
              <span className="text-sm font-medium">{stringConnector}</span>
              {logoUrl ? (
                <a
                  href={logoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                  aria-label="Visit organization website"
                >
                  <Image
                    src={signature}
                    alt="Signature"
                    width={90}
                    height={28}
                  />
                </a>
              ) : (
                <Image
                  src={signature}
                  alt="Signature"
                  width={90}
                  height={28}
                />
              )}
            </>
          )}
        </div>
      </div>
      <LanguageSelect />
    </header>
  )
}

export default Header
