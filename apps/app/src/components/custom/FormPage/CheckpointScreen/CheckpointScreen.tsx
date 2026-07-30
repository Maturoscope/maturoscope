"use client"

import { useState } from "react"
import { motion } from "motion/react"
// Components
import Heading from "@/components/common/Heading/Heading"
import { Button } from "@/components/ui/button"
import { ArrowNextIcon } from "@/components/icons"
import { getIconComponent } from "@/components/icons/iconMap"
// Animations
import { REVEAL_CONTAINER_VARIANT, REVEAL_ITEM_VARIANT } from "@/animations/common"

// Gentle spring "pop" for the milestone icon — rewarding but restrained.
const ICON_POP_VARIANT = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 18 },
  },
}

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
    <motion.div
      variants={REVEAL_CONTAINER_VARIANT}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center w-full h-full max-w-[1280px] px-6 pb-26 pt-24 lg:pt-0"
    >
      {IconComponent && (
        <motion.div variants={ICON_POP_VARIANT}>
          <IconComponent accent className="w-[60px] h-[60px]" />
        </motion.div>
      )}
      <Heading
        title={title}
        description={description}
        animated
        className="my-8 w-full max-w-[725px] text-center items-center gap-6 [&_h1]:font-bold"
      />
      <motion.div
        variants={REVEAL_ITEM_VARIANT}
        className="flex items-center justify-between gap-3"
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
      </motion.div>
    </motion.div>
  )
}

export default CheckpointScreen
