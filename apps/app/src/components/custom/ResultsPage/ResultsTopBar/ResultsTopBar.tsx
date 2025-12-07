"use client"

// Components
import { Button } from "@/components/ui/button"
// Utils
import { cn } from "@/lib/utils"

export interface ResultsTopBarProps {
  title: string
  subtitle: string
  downloadButtonLabel: string
  talkButtonLabel: string
}

interface ExtraProps {
  className?: string
}

const ResultsTopBar = ({
  title,
  subtitle,
  downloadButtonLabel,
  talkButtonLabel,
  className,
}: ResultsTopBarProps & ExtraProps) => {
  return (
    <div
      className={cn(
        "w-full flex items-center flex-wrap gap-y-4 justify-between p-4 lg:px-6 py-4 bg-white border-b border-border",
        className
      )}
    >
      <div className="flex flex-col items-start justify-start">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">{downloadButtonLabel}</Button>
        <Button variant="default" accent>
          {talkButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default ResultsTopBar
