"use client"

// Utils
import { cn } from "@/lib/utils"
// Components
import { Button } from "@/components/ui/button"

export interface CTABannerProps {
  title: string
  description: string
  or: string
  talkButtonLabel: string
  resetButtonLabel: string
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
  className,
}: CTABannerProps & ExtraProps) => {
  const handleTalkButtonClick = () => {
    console.log("talk button clicked")
  }

  const handleResetButtonClick = () => {
    console.log("reset button clicked")
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mt-11 px-4 lg:px-6 mb-8">
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
        <Button onClick={handleResetButtonClick} variant="outline">
          {resetButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default CTABanner
