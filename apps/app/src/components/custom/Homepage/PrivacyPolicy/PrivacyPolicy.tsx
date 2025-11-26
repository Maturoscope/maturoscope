"use client"

// Packages
import Image from "next/image"
import { motion } from "motion/react"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"

export interface PrivacyPolicyProps {
  description: string
  copyright: string
}

const SYNOPP_URL = "https://synopp.io/"

const PrivacyPolicy = ({ description, copyright }: PrivacyPolicyProps) => {
  return (
    <motion.div
      variants={SIMPLE_FADE_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col lg:flex-row gap-8 lg:gap-4 w-full p-6 bg-white border border-border justify-between lg:items-end items-start shrink-0"
    >
      <div className="flex lg:flex-row flex-col items-start lg:items-center gap-4">
        <Image
          src="/icons/homepage/flag-europe.svg"
          alt="Europe Flag"
          width={72}
          height={48}
        />
        <p className="text-xs text-muted-foreground max-w-[765px]">
          {description}
        </p>
      </div>
      <p className="text-sm text-muted-foreground w-max">
        {copyright}{" "}
        <a
          href={SYNOPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          Synopp
        </a>
      </p>
    </motion.div>
  )
}

export default PrivacyPolicy
