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

export interface BeforeWeBeginProps {
  title: string
  paragraphs: string[]
  buttonLabel: string
  loadingLabel?: string
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
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-sm border border-border/60 p-8 flex flex-col items-center gap-6">
        <div className="reveal-pop flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10">
          <ClipboardCheck className="w-6 h-6 text-accent" />
        </div>

        <h1
          className="reveal text-2xl font-bold text-center"
          style={{ "--reveal-delay": "0.12s" } as React.CSSProperties}
        >
          {title}
        </h1>

        <div className="flex flex-col gap-4 w-full">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="reveal text-sm text-muted-foreground"
              style={
                {
                  "--reveal-delay": `${0.2 + index * 0.08}s`,
                } as React.CSSProperties
              }
            >
              {renderWithBold(paragraph)}
            </p>
          ))}
        </div>

        <div
          className="reveal w-full"
          style={{ "--reveal-delay": "0.44s" } as React.CSSProperties}
        >
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
        </div>
      </div>
    </div>
  )
}

export default BeforeWeBegin
