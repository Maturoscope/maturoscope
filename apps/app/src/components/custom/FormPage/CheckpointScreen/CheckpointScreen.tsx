"use client"

import { useState } from "react"
import { motion } from "motion/react"
// Components
import Heading from "@/components/common/Heading/Heading"
import { Button } from "@/components/ui/button"
import { ArrowNextIcon } from "@/components/icons"
import { getIconComponent } from "@/components/icons/iconMap"

interface CheckpointScreenProps {
  icon: string
  title: string
  description: string
  reviewLabel: string
  buttonLabel: string
  loadingLabel?: string
  onButtonClick: () => void | Promise<void>
  onReviewClick: () => void
}

const CheckpointScreen = ({
  icon,
  title,
  description,
  buttonLabel,
  reviewLabel,
  loadingLabel = "Loading...",
  onButtonClick,
  onReviewClick,
}: CheckpointScreenProps) => {
  const IconComponent = getIconComponent(icon)
  const [isReviewLoading, setIsReviewLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const handleReviewClick = () => {
    setIsReviewLoading(true)
    onReviewClick()
  }

  const handleButtonClick = async () => {
    setIsButtonLoading(true)
    await onButtonClick()
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-[1280px] px-6 pb-26 pt-24 lg:pt-0">
      {IconComponent && (
        <div className="reveal-pop">
          <IconComponent accent className="w-[60px] h-[60px]" />
        </div>
      )}
      <Heading
        title={title}
        description={description}
        animated
        revealDelay={0.12}
        className="my-8 w-full max-w-[725px] text-center items-center gap-6 [&_h1]:font-bold"
      />
      <div
        className="reveal flex items-center justify-between gap-3"
        style={{ "--reveal-delay": "0.34s" } as React.CSSProperties}
      >
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            onClick={handleReviewClick}
            className="bg-white border border-border text-foreground hover:bg-foreground/5"
            disabled={isReviewLoading || isButtonLoading}
          >
            <span>{isReviewLoading ? loadingLabel : reviewLabel}</span>
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button onClick={handleButtonClick} accent disabled={isReviewLoading || isButtonLoading}>
            <span>{isButtonLoading ? loadingLabel : buttonLabel}</span>
            {!isButtonLoading && <ArrowNextIcon className="w-4 h-4" />}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default CheckpointScreen
