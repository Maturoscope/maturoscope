"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
// Components
import { Button } from "@/components/ui/button"
import {
  NoAccountIcon,
  NoStoredIcon,
  ArrowNextIcon,
  ClockIcon,
} from "@/components/icons"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"
// Actions
import { trackStartedAssessment } from "@/actions/tracking"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

export interface InformationProps {
  noAccount: string
  noStored: string
  tooltip: string
  buttonLabel: string
  estimatedTime: string
}

const Information = ({
  noAccount,
  noStored,
  tooltip,
  buttonLabel,
  estimatedTime,
}: InformationProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const nextPage = `/${lang}/begin`
  const router = useRouter()
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
    }

    // Check on mount
    checkMobile()

    // Check on resize
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLetsBeginClick = async () => {
    await trackStartedAssessment()
    router.push(nextPage)
  }

  const handleTooltipClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault()
      e.stopPropagation()
      setIsTooltipOpen(!isTooltipOpen)
    }
  }

  const handleTooltipOpenChange = (open: boolean) => {
    if (isMobile) {
      setIsTooltipOpen(open)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2.5 items-center justify-start">
          <div className="p-2.5 rounded-md border border-border bg-[#FAFAF9] flex items-center justify-center">
            <NoAccountIcon accent className="w-5 h-5" />
          </div>
          <span className="text-base text-foreground">{noAccount}</span>
        </div>
        <div className="flex gap-2.5 items-center justify-start">
          <div className="p-2.5 rounded-md border border-border bg-[#FAFAF9] flex items-center justify-center">
            <NoStoredIcon accent className="w-5 h-5" />
          </div>
          <span className="text-base text-foreground">{noStored}</span>
          <Tooltip
            open={isMobile ? isTooltipOpen : undefined}
            onOpenChange={handleTooltipOpenChange}
            disableHoverableContent={isMobile}
          >
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-foreground cursor-pointer"
                onClick={handleTooltipClick}
              >
                <InfoIcon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[385px]">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
      </div >

      <div className="w-full flex items-center justify-start gap-5 mt-7">
        <Button
          variant="default"
          size="lg"
          className="w-max h-9 px-4 rounded-md flex items-center justify-center gap-2"
          accent
          onClick={handleLetsBeginClick}
        >
          {buttonLabel}
          <ArrowNextIcon className="w-4 h-4" />
        </Button>

        <div className="flex items-center justify-start gap-1.5">
          <ClockIcon className="w-5 h-5 text-muted-foreground" />
          <span className="text-base text-muted-foreground font-semibold">
            {estimatedTime}
          </span>
        </div>
      </div>
    </>
  )
}

export default Information
