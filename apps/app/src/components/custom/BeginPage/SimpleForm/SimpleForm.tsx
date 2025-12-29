"use client"

import { useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"

export interface SimpleFormProps {
  title: string
  label: string
  placeholder: string
  backButtonLabel: string
  nextButtonLabel: string
}

const SimpleForm = ({
  title,
  label,
  placeholder,
  backButtonLabel,
  nextButtonLabel,
}: SimpleFormProps) => {
  const [projectName, setProjectName] = useState("")
  const isNextButtonDisabled = !projectName.trim()
  const router = useRouter()
  const { lang } = useParams<{ lang: Locale }>()

  const handleBackButtonClick = () => {
    router.push(`/${lang}/`)
  }

  const handleNextButtonClick = () => {
    localStorage.setItem("projectName", projectName)
    router.push(`/${lang}/form`)
  }

  return (
    <div className="h-full w-full max-w-[750px] flex flex-col px-4 lg:px-0">
      <div className="w-full h-full flex flex-col gap-4 justify-center">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-foreground">
          {title}
        </h1>
        <p className="text-2xl text-foreground font-semibold">{label}</p>
        <input
          placeholder={placeholder}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          type="text"
          className="w-full h-9 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background data-placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        />
      </div>

      <div className="w-full mb-4 lg:mb-8 flex items-center justify-between gap-3">
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
          <span>{nextButtonLabel}</span>
          <Image
            src="/icons/form/arrow-next.svg"
            alt="Arrow Next"
            width={16}
            height={16}
          />
        </Button>
      </div>
    </div>
  )
}

export default SimpleForm
