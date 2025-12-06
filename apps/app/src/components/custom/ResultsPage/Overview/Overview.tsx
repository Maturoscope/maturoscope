"use client"

// Utils
import { cn } from "@/lib/utils"

export interface OverviewProps {
  title: string
  learnMoreButtonLabel: string
  resultsSufixLabel: string
}

interface ExtraProps {
  className?: string
}

const Overview = ({
  title,
  learnMoreButtonLabel,
  resultsSufixLabel,
  className,
}: OverviewProps & ExtraProps) => {
  console.log(title, learnMoreButtonLabel, resultsSufixLabel, className)

  return (
    <div className={cn(className)}>
      <h1>Overview</h1>
    </div>
  )
}

export default Overview
