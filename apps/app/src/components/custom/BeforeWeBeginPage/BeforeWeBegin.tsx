"use client"

// Packages
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ClipboardCheck } from "lucide-react"
// Components
import { Button } from "@/components/ui/button"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"
// Actions
import { trackStartedAssessment } from "@/actions/tracking"
// Animations
import { REVEAL_CONTAINER_VARIANT, REVEAL_ITEM_VARIANT } from "@/animations/common"

export interface BeforeWeBeginProps {
  title: string
  paragraphs: string[]
  buttonLabel: string
  loadingLabel?: string
}

// Gentle spring "pop" for the icon — consistent with the checkpoint screen.
const ICON_POP_VARIANT = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 18 },
  },
}

// Renders **bold** segments (markdown-style) within a translated string.
const renderWithBold = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  )

const BeforeWeBegin = ({
  title,
  paragraphs,
  buttonLabel,
  loadingLabel = "Loading...",
}: BeforeWeBeginProps) => {
  const { lang } = useParams<{ lang: Locale }>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    await trackStartedAssessment()
    router.push(`/${lang}/begin`)
  }

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-8">
      <motion.div
        variants={REVEAL_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-border/60 p-8 flex flex-col items-center gap-6"
      >
        <motion.div
          variants={ICON_POP_VARIANT}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10"
        >
          <ClipboardCheck className="w-6 h-6 text-accent" />
        </motion.div>

        <motion.h1
          variants={REVEAL_ITEM_VARIANT}
          className="text-2xl font-bold text-center"
        >
          {title}
        </motion.h1>

        <div className="flex flex-col gap-4 w-full">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              variants={REVEAL_ITEM_VARIANT}
              className="text-sm text-muted-foreground"
            >
              {renderWithBold(paragraph)}
            </motion.p>
          ))}
        </div>

        <motion.div variants={REVEAL_ITEM_VARIANT} className="w-full">
          <motion.div
            className="w-full"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              accent
              onClick={handleStart}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? loadingLabel : buttonLabel}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default BeforeWeBegin
