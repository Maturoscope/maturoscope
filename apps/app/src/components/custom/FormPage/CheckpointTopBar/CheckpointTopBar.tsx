"use client"

// Packages
import Image from "next/image"
import { useParams } from "next/navigation"
// Utils
import { cn } from "@/lib/utils"
// Context
import { useProgressContext } from "@/context/ProgressContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CheckpointTopBarProps {
  buttonLabel: string
  className?: string
}

const CheckpointTopBar = ({
  buttonLabel,
  className,
}: CheckpointTopBarProps) => {
  const { isCheckpoint, currStage } = useProgressContext()
  const { lang } = useParams()

  if (!isCheckpoint) return

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
          <span>
            {buttonLabel} {currStage.name}
          </span>
        </Button>
      </Link>
    </div>
  )
}

export default CheckpointTopBar
