"use client"

// Packages
import { motion } from "motion/react"
// Animations
import { EASE_OUT, FADE_IN_UP_VARIANT } from "@/animations/common"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  /** Delay before the entrance animation starts, in seconds. */
  delay?: number
}

/**
 * Subtle fade-up entrance wrapper. Motion is automatically disabled for users
 * who prefer reduced motion (handled globally via MotionConfig in the layout).
 */
const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => {
  return (
    <motion.div
      className={className}
      variants={FADE_IN_UP_VARIANT}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn
