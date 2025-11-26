"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
// Components
import { Button } from "@/components/ui/button"
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

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2.5 items-center justify-start">
          <div className="p-2.5 rounded-md border border-border bg-[#FAFAF9] flex items-center justify-center">
            <Image
              src="/icons/homepage/no-account.svg"
              alt="No account"
              width={20}
              height={20}
            />
          </div>
          <span className="text-base text-foreground">{noAccount}</span>
        </div>
        <div className="flex gap-2.5 items-center justify-start">
          <div className="p-2.5 rounded-md border border-border bg-[#FAFAF9] flex items-center justify-center">
            <Image
              src="/icons/homepage/no-stored.svg"
              alt="No account"
              width={20}
              height={20}
            />
          </div>
          <span className="text-base text-foreground">{noStored}</span>
        </div>
      </div>

      <div className="w-full flex items-center justify-start gap-5 mt-7">
        <Link href={`/${lang}/why`} className="w-max h-9">
          <Button
            variant="default"
            size="lg"
            className="w-max px-4 rounded-md flex items-center justify-center gap-2 h-full"
          >
            {buttonLabel}
            <Image
              src="/icons/form/arrow-next.svg"
              alt="Arrow right"
              width={16}
              height={16}
            />
          </Button>
        </Link>

        <div className="flex items-center justify-start gap-1.5">
          <Image
            src="/icons/homepage/clock.svg"
            alt="Clock"
            width={20}
            height={20}
          />
          <span className="text-base text-muted-foreground font-semibold">
            {estimatedTime}
          </span>
        </div>
      </div>
    </>
  )
}

export default Information
