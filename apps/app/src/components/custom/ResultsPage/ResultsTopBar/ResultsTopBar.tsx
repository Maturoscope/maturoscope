"use client"

// Packages
import { useState, useEffect } from "react"
// Components
import { Button } from "@/components/ui/button"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
// Utils
import { cn } from "@/lib/utils"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Hooks
import { useDownloadReport } from "@/hooks/useDownloadReport"

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
  const { openModal } = useContactExpertContext()
  const { downloadReport, isLoading } = useDownloadReport(lang)

  const handleTalkButtonClick = () => {
    openModal()
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

  const handleDownloadClick = async () => {
    await downloadReport()
  }

  return (
    <div
      className={cn(
        "w-full flex items-center flex-wrap gap-y-4 justify-between p-4 lg:px-6 py-4 bg-white border-b border-border",
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
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : downloadButtonLabel}
        </Button>
        <Button variant="default" accent onClick={handleTalkButtonClick}>
          {talkButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default ResultsTopBar
