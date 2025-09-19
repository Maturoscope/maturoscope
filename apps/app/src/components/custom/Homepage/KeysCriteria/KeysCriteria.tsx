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
    <Box>
      <div className="flex flex-col items-start justify-start w-full max-w-[584px] gap-8">
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
          className="flex flex-col items-start justify-start w-full gap-6"
        >
          {keys.map((key) => (
            <motion.li
              key={key.icon}
              variants={STAGGERED_LIST_ITEM_VARIANT}
              className="flex items-start justify-start w-full gap-4"
            >
              <Image src={key.icon} alt={key.title} width={24} height={24} />
              <div className="flex flex-col items-start justify-start gap-1.5">
                <span className="text-base font-semibold text-foreground">
                  {key.title}
                </span>
                <span className="text-base text-muted-foreground">
                  {key.description}
                </span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Box>
  )
}

export default KeysCriteria
