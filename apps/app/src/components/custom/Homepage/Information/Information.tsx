"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
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

export interface InformationProps {
  noAccount: string
  noStored: string
  buttonLabel: string
  estimatedTime: string
}

const Information = ({
  noAccount,
  noStored,
  buttonLabel,
  estimatedTime,
}: InformationProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const nextPage = `/${lang}/begin`

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
        </div>
      </div>

      <div className="w-full flex items-center justify-start gap-5 mt-7">
        <Link href={nextPage} className="w-max h-9">
          <Button
            variant="default"
            size="lg"
            className="w-max px-4 rounded-md flex items-center justify-center gap-2 h-full"
            accent
          >
            {buttonLabel}
            <ArrowNextIcon className="w-4 h-4" />
          </Button>
        </Link>

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
