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
      className="flex gap-4 w-full p-6 bg-white border border-border justify-between items-end"
    >
      <div className="flex lg:flex-row flex-col items-center gap-4">
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
      <p className="text-sm text-muted-foreground">
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
