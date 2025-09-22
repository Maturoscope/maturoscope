"use client"

// Packages
import Image from "next/image"
import { motion } from "motion/react"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"

export interface PrivacyPolicyProps {
  description: string
}

const PrivacyPolicy = ({ description }: PrivacyPolicyProps) => {
  return (
    <motion.div
      variants={SIMPLE_FADE_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex gap-4 w-full max-w-[1280px] px-6 mt-11 lg:flex-row flex-col"
    >
      <Image
        src="/icons/homepage/flag-europe.svg"
        alt="Europe Flag"
        width={90}
        height={60}
      />
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}

export default PrivacyPolicy
