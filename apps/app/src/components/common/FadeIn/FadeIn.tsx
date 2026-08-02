// Utils
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  /** Delay before the entrance animation starts, in seconds. */
  delay?: number
}

/**
 * Subtle fade-up entrance wrapper. CSS-driven (compositor) so it stays smooth
 * on mobile during hydration; disabled under prefers-reduced-motion via the
 * `.reveal` rule in globals.css.
 */
const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => {
  return (
    <div
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

export default FadeIn
