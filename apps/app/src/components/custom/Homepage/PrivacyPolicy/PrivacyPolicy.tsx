"use client"

// Packages
import Image from "next/image"
import { motion } from "motion/react"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"

export interface PrivacyPolicyProps {
  description: string
  copyright: string
  contactUsLabel: string
  privacyPolicyLabel: string
}

const SYNOPP_URL = "https://synopp.io/"
const EMAIL_ADDRESS = "hello@synopp.io"

const PrivacyPolicy = ({ description, copyright, contactUsLabel, privacyPolicyLabel }: PrivacyPolicyProps) => {
  return (
    <motion.div
      variants={SIMPLE_FADE_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col lg:flex-row gap-8 lg:gap-4 w-full p-6 bg-white justify-between lg:items-end items-start shrink-0"
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
      <div className="flex flex-col gap-3.5 lg:items-end justify-between h-full">
        <div className="flex gap-4 items-center">
          <a href={`mailto:${EMAIL_ADDRESS}?subject=Contact%20from%20Maturoscope`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
            {contactUsLabel}
          </a>
          <div className="h-3.5 w-px bg-border" />
          <a href={SYNOPP_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
            {privacyPolicyLabel}
          </a>
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
      </div>
    </motion.div>
  )
}

export default PrivacyPolicy
