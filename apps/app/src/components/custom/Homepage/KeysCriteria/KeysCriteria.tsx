"use client"

// Packages
import Image from "next/image"
import { motion } from "motion/react"
// Components
import Box from "@/components/common/Box/Box"
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
    <div className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-3">
      <motion.span
        variants={SIMPLE_FADE_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-lg font-semibold text-foreground"
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
        {keys.map((key) => (
          <Box key={key.icon}>
            <motion.li
              variants={STAGGERED_LIST_ITEM_VARIANT}
              className="flex items-start justify-start w-full gap-4 lg:flex-row flex-col"
            >
              <div className="flex items-center justify-center aspect-square w-10 h-10 rounded-md bg-primary/5">
                <Image src={key.icon} alt={key.title} width={20} height={20} />
              </div>
              <div className="flex flex-col items-start justify-start gap-1.5">
                <span className="text-base font-semibold text-foreground">
                  {key.title}
                </span>
                <span className="text-base text-muted-foreground">
                  {key.description}
                </span>
              </div>
            </motion.li>
          </Box>
        ))}
      </motion.ul>
    </div>
  )
}

export default KeysCriteria
