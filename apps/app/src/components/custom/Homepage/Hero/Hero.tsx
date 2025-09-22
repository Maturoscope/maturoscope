"use client"

// Packages
import Link from "next/link"
import { motion } from "motion/react"
import { useParams } from "next/navigation"
// Components
import { Button } from "@/components/ui/button"
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"
import KeysCriteria, {
  KeysCriteriaProps,
} from "@/components/custom/Homepage/KeysCriteria/KeysCriteria"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"

export interface HeroProps {
  heading: HeadingProps & { buttonLabel: string }
  criteria: KeysCriteriaProps
}

const Hero = ({ heading, criteria }: HeroProps) => {
  const { buttonLabel } = heading
  const { lang } = useParams<{ lang: Locale }>()

  return (
    <div className="flex lg:items-start justify-between w-full max-w-[1280px] gap-12 lg:gap-16 px-6 lg:flex-row flex-col items-center">
      <motion.div
        variants={SIMPLE_FADE_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-12"
      >
        <Heading {...heading} />
        <Link href={`/${lang}/why`} className="w-full">
          <Button variant="default" size="lg" className="w-full">
            {buttonLabel}
          </Button>
        </Link>
      </motion.div>
      <KeysCriteria {...criteria} />
    </div>
  )
}

export default Hero
