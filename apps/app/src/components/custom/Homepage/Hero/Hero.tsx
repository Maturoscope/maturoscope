"use client"

// Packages
import { motion } from "motion/react"
// Components
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"
import Information, {
  InformationProps,
} from "@/components/custom/Homepage/Information/Information"
import KeysCriteria, {
  KeysCriteriaProps,
} from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"
// Animations
import { REVEAL_CONTAINER_VARIANT } from "@/animations/common"

export interface HeroProps {
  heading: HeadingProps
  information: InformationProps
  criteria: KeysCriteriaProps
}

const Hero = ({ heading, information, criteria }: HeroProps) => {
  return (
    <div className="flex lg:items-start justify-between w-full max-w-[1280px] gap-14 lg:gap-16 px-6 lg:flex-row flex-col items-center pt-11 pb-6">
      <motion.div
        variants={REVEAL_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-9"
      >
        <Heading {...heading} animated />
        <Information {...information} />
      </motion.div>

      <KeysCriteria {...criteria} />
    </div>
  )
}

export default Hero
