"use client"

import { useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
// Utils
import { cn } from "@/lib/utils"
// Components
import { Button } from "@/components/ui/button"

export interface BackToHomeBarProps {
  buttonLabel: string
  loadingLabel?: string
}

interface ExtraProps {
  className?: string
}
const BackToHomeBar = ({
  buttonLabel,
  loadingLabel = "Loading...",
  className,
}: BackToHomeBarProps & ExtraProps) => {
  const { lang } = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBackClick = () => {
    setIsLoading(true)
    router.push(`/${lang}/form/`)
  }

  return (
    <div
      className={cn(
        "w-full flex items-center justify-start px-4 lg:px-6 bg-white py-4 border-b border-border h-[60px]",
        className
      )}
    >
      <Button
        onClick={handleBackClick}
        disabled={isLoading}
        className="bg-white border border-border text-foreground hover:bg-foreground/5"
      >
        {!isLoading && (
          <Image
            src="/icons/form/arrow-prev.svg"
            alt="Arrow Prev"
            width={16}
            height={16}
          />
        )}
        <span>{isLoading ? loadingLabel : buttonLabel}</span>
      </Button>
    </div>
  )
}

export default BackToHomeBar
