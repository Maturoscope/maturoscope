"use client"

// Packages
import { motion } from "motion/react"
// Animations
import { EASE_OUT } from "@/animations/common"

/**
 * Route-level transition. Unlike `layout.tsx`, a `template.tsx` re-mounts on
 * every navigation, so this subtle fade-in plays on each route change and
 * removes the abrupt "snap" when moving between screens in the flow.
 * Motion is disabled automatically for users who prefer reduced motion
 * (handled globally via MotionConfig in the layout).
 *
 * Note: we animate opacity only (no transform). Several screens in the flow
 * have `position: fixed` headers/top bars, and a transform on an ancestor
 * would break their positioning, so a plain crossfade is intentional here.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
