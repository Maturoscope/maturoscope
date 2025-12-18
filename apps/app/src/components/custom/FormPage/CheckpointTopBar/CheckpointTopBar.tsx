"use client"

// Packages
import Image from "next/image"
// Utils
import { cn } from "@/lib/utils"
// Context
import { useProgressContext } from "@/context/ProgressContext"
import { Button } from "@/components/ui/button"

interface CheckpointTopBarProps {
  buttonLabel: string
  className?: string
}

const CheckpointTopBar = ({
  buttonLabel,
  className,
}: CheckpointTopBarProps) => {
  const { isCheckpoint, currStage, handleBackToLastQuestionClick } =
    useProgressContext()

  if (!isCheckpoint) return

  return (
    <div
      className={cn(
        "w-full flex items-center justify-start px-4 lg:px-6 bg-white py-4 border-b border-border h-[60px]",
        className
      )}
    >
      <Button
        onClick={handleBackToLastQuestionClick}
        className="bg-white border border-border text-foreground hover:bg-foreground/5"
      >
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
    </div>
  )
}

export default CheckpointTopBar
