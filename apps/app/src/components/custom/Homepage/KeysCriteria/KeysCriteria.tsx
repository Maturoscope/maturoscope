"use client"

// Packages
import { motion } from "motion/react"
// Components
import Box from "@/components/common/Box/Box"
import { getIconComponent } from "@/components/icons/iconMap"
// Animations
import {
  SIMPLE_FADE_VARIANT,
  STAGGERED_LIST_ITEM_VARIANT,
  STAGGERED_LIST_VARIANT,
} from "@/animations/common"
// Types
import { ListItem } from "@/types/list-item"

export interface KeysCriteriaProps {
  title: string
  keys: ListItem[]
}

const KeysCriteria = ({ title, keys }: KeysCriteriaProps) => {
  return (
    <div className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-5">
      <motion.span
        variants={SIMPLE_FADE_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-sm font-semibold text-foreground uppercase"
      >
        {title}
      </motion.span>
      <motion.ul
        variants={STAGGERED_LIST_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-start justify-start w-full gap-3"
      >
        {keys.map((key) => {
          const IconComponent = getIconComponent(key.icon)

          return (
            <Box key={key.icon}>
              <motion.li
                variants={STAGGERED_LIST_ITEM_VARIANT}
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
                </div>
              </motion.li>
            </Box>
          )
        })}
      </motion.ul>
    </div>
  )
}

export default KeysCriteria
