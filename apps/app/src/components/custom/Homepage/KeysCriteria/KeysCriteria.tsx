"use client"

// Packages
import { motion } from "motion/react"
// Components
import Box from "@/components/common/Box/Box"
import { getIconComponent } from "@/components/icons/iconMap"
// Animations
import { REVEAL_GROUP_VARIANT, REVEAL_ITEM_VARIANT } from "@/animations/common"
// Types
import { ListItem } from "@/types/list-item"

export interface KeysCriteriaProps {
  title: string
  keys: ListItem[]
}

// Reveals the criteria column shortly after the left column starts, so the
// whole hero cascades top-to-bottom as one coordinated entrance.
const CRITERIA_CONTAINER_VARIANT = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const KeysCriteria = ({ title, keys }: KeysCriteriaProps) => {
  return (
    <motion.div
      variants={CRITERIA_CONTAINER_VARIANT}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-5"
    >
      <motion.span
        variants={REVEAL_ITEM_VARIANT}
        className="text-sm font-semibold text-foreground uppercase"
      >
        {title}
      </motion.span>
      <motion.ul
        variants={REVEAL_GROUP_VARIANT}
        className="flex flex-col items-start justify-start w-full gap-3"
      >
        {keys.map((key) => {
          const IconComponent = getIconComponent(key.icon)

          return (
            <Box key={key.icon}>
              <motion.li
                variants={REVEAL_ITEM_VARIANT}
                whileHover={{
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                className="flex items-start justify-start w-full gap-4 lg:flex-row flex-col"
              >
                <div className="flex items-center justify-center aspect-square w-10 h-10 rounded-md bg-neutral-50 border border-border">
                  {IconComponent ?
                    <IconComponent accent className="w-5 h-5" />
                  : <span className="text-xs text-muted-foreground">?</span>}
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-lg lg:text-xl font-semibold text-foreground">
                    {key.title}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {key.description}
                  </span>
                  {key.questionsCount && (
                    <span className="text-sm text-muted-foreground">
                      {key.questionsCount}
                    </span>
                  )}
                </div>
              </motion.li>
            </Box>
          )
        })}
      </motion.ul>
    </motion.div>
  )
}

export default KeysCriteria
