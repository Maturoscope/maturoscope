"use client"

import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
// Utils
import { cn } from "@/lib/utils"
// Components
import { Button } from "@/components/ui/button"

export interface BackToHomeBarProps {
  buttonLabel: string
}

interface ExtraProps {
  className?: string
}
const BackToHomeBar = ({
  buttonLabel,
  className,
}: BackToHomeBarProps & ExtraProps) => {
  const { lang } = useParams()

  return (
    <div
      className={cn(
        "w-full flex items-center justify-start px-4 lg:px-6 bg-white py-4 border-b border-border h-[60px]",
        className
      )}
    >
      <Link href={`/${lang}/form/`}>
        <Button className="bg-white border border-border text-foreground hover:bg-foreground/5">
          <Image
            src="/icons/form/arrow-prev.svg"
            alt="Arrow Prev"
            width={16}
            height={16}
          />
          <span>{buttonLabel}</span>
        </Button>
      </Link>
    </div>
  )
}

export default BackToHomeBar
