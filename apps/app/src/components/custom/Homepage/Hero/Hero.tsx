"use client"

// Packages
import Link from "next/link"
import Image from "next/image"
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
  heading: HeadingProps & {
    buttonLabel: string
    estimatedTime: string
  }
  information: { noAccount: string; noStored: string }
  criteria: KeysCriteriaProps
}

const Hero = ({ heading, information, criteria }: HeroProps) => {
  const { buttonLabel, estimatedTime } = heading
  const { lang } = useParams<{ lang: Locale }>()

  return (
    <div className="flex lg:items-start justify-between w-full max-w-[1280px] gap-12 lg:gap-16 px-6 lg:flex-row flex-col items-center pt-11 pb-6">
      <motion.div
        variants={SIMPLE_FADE_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-9"
      >
        <Heading {...heading} />

        <div className="flex flex-col gap-2">
          <div className="flex gap-2.5 items-center justify-start">
            <div className="p-2.5 rounded-md border border-border bg-[#FAFAF9] flex items-center justify-center">
              <Image
                src="/icons/homepage/no-account.svg"
                alt="No account"
                width={20}
                height={20}
              />
            </div>
            <span className="text-base text-foreground">
              {information.noAccount}
            </span>
          </div>
          <div className="flex gap-2.5 items-center justify-start">
            <div className="p-2.5 rounded-md border border-border bg-[#FAFAF9] flex items-center justify-center">
              <Image
                src="/icons/homepage/no-stored.svg"
                alt="No account"
                width={20}
                height={20}
              />
            </div>
            <span className="text-base text-foreground">
              {information.noStored}
            </span>
          </div>
        </div>

        <div className="w-full flex items-center justify-start gap-5 mt-7">
          <Link href={`/${lang}/why`} className="w-max h-9">
            <Button
              variant="default"
              size="lg"
              className="w-max px-4 rounded-md flex items-center justify-center gap-2 h-full"
            >
              {buttonLabel}
              <Image
                src="/icons/form/arrow-next.svg"
                alt="Arrow right"
                width={16}
                height={16}
              />
            </Button>
          </Link>

          <div className="flex items-center justify-start gap-1.5">
            <Image
              src="/icons/homepage/clock.svg"
              alt="Clock"
              width={20}
              height={20}
            />
            <span className="text-base text-muted-foreground font-semibold">
              {estimatedTime}
            </span>
          </div>
        </div>
      </motion.div>

      <KeysCriteria {...criteria} />
    </div>
  )
}

export default Hero
