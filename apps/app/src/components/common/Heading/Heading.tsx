"use client"

// Packages
import { motion } from "motion/react"
// Utils
import { cn } from "@/lib/utils"
// Animations
import { REVEAL_GROUP_VARIANT, REVEAL_ITEM_VARIANT } from "@/animations/common"

export interface HeadingProps {
  title: string
  description?: string
  tagline?: string
  className?: string
  /**
   * When true, the tagline/title/description reveal in a subtle staggered
   * cascade. Inherits its trigger from a parent motion container.
   */
  animated?: boolean
}

const Heading = ({
  title,
  description,
  tagline,
  className,
  animated = false,
}: HeadingProps) => {
  const containerClassName = cn(
    "flex flex-col items-start justify-start w-full gap-4",
    className
  )

  if (!animated) {
    return (
      <div className={containerClassName}>
        {tagline && (
          <span className="text-sm font-medium text-muted-foreground">
            {tagline}
          </span>
        )}
        <h1 className="text-4xl lg:text-5xl font-semibold">{title}</h1>
        {description && (
          <p className="text-base text-muted-foreground whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
    )
  }

  return (
    <motion.div variants={REVEAL_GROUP_VARIANT} className={containerClassName}>
      {tagline && (
        <motion.span
          variants={REVEAL_ITEM_VARIANT}
          className="text-sm font-medium text-muted-foreground"
        >
          {tagline}
        </motion.span>
      )}
      <motion.h1
        variants={REVEAL_ITEM_VARIANT}
        className="text-4xl lg:text-5xl font-semibold"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          variants={REVEAL_ITEM_VARIANT}
          className="text-base text-muted-foreground whitespace-pre-line"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}

export default Heading
