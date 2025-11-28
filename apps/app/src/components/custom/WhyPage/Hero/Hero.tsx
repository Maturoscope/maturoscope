"use client"

// Packages
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "motion/react"
// Components
import { Button } from "@/components/ui/button"
import Heading, { HeadingProps } from "@/components/common/Heading/Heading"
// Animations
import {
  SIMPLE_FADE_VARIANT,
  STAGGERED_LIST_ITEM_VARIANT,
  STAGGERED_LIST_VARIANT,
} from "@/animations/common"
// Types
import { ListItem } from "@/types/list-item"
import { Locale } from "@/dictionaries/dictionaries"

export interface HeroProps {
  heading: HeadingProps & {
    list: ListItem[]
    buttonLabel: string
  }
  checks: ListItem[]
}

const Hero = ({ heading, checks }: HeroProps) => {
  const { buttonLabel, list } = heading
  const { lang } = useParams<{ lang: Locale }>()

  return (
    <div className="flex lg:items-start justify-between w-full max-w-[1280px] gap-12 lg:gap-16 px-6 lg:flex-row flex-col items-center h-full py-14">
      <motion.div
        variants={SIMPLE_FADE_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-start justify-start w-full lg:max-w-[584px] gap-12"
      >
        <Heading {...heading} />
        <motion.ul
          variants={STAGGERED_LIST_VARIANT}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full flex flex-col gap-6"
        >
          {list.map((item) => (
            <motion.li
              key={item.title}
              variants={STAGGERED_LIST_ITEM_VARIANT}
              className="flex items-start justify-start gap-4 lg:gap-5"
            >
              <div className="flex items-center justify-center aspect-square w-10 h-10 border rounded-md">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={20}
                  height={20}
                />
              </div>
              <div className="flex flex-col items-start justify-start gap-2">
                <p className="text-base font-semibold text-foreground">
                  {item.title}
                </p>
                <span className="text-base text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
        <Link href={`/${lang}/form`} className="w-full">
          <Button variant="default" size="lg" className="w-full">
            {buttonLabel}
          </Button>
        </Link>
      </motion.div>
      <motion.ul
        variants={STAGGERED_LIST_VARIANT}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full lg:max-w-[584px] flex flex-col gap-8"
      >
        {checks.map((item) => (
          <motion.li
            key={item.title}
            variants={STAGGERED_LIST_ITEM_VARIANT}
            className="flex items-start justify-start gap-4"
          >
            <Image src={item.icon} alt={item.title} width={20} height={20} />
            <div className="flex flex-col items-start justify-start gap-1">
              <p className="text-base font-semibold text-foreground">
                {item.title}
              </p>
              <span className="text-base text-muted-foreground">
                {item.description}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}

export default Hero
