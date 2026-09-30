"use client"

import Image from "next/image"
import { Timer } from "lucide-react"
import { motion } from "motion/react"
import type { LandingDictionary } from "@/dictionaries/landing"
import { SECTION_IDS } from "./constants"

interface HeroProps {
  dict: LandingDictionary["hero"]
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export default function Hero({ dict }: HeroProps) {
  return (
    <section className="w-full">
      <div className="mx-auto flex max-w-[1165px] flex-col items-center px-5 pb-8 pt-16 text-center md:px-10 md:pt-24">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-[960px] text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-[#0A0A0A] sm:text-5xl lg:text-[60px]"
        >
          {dict.title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
          className="mt-6 max-w-[760px] text-base leading-relaxed text-[#525252] md:text-lg"
        >
          {dict.subtitle}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          className="mt-8 flex items-center gap-5"
        >
          <a
            href={`#${SECTION_IDS.hosts}`}
            className="rounded-lg bg-[#C0410F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A6380D]"
          >
            {dict.cta}
          </a>
          <span className="flex items-center gap-2 text-sm font-semibold text-[#525252]">
            <Timer className="h-5 w-5" />
            {dict.timeEstimate}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
          className="mt-14 w-full"
        >
          <Image
            src="/landing/hero-product.png"
            alt="Maturoscope maturity profile"
            width={2130}
            height={1396}
            sizes="(max-width: 1165px) 100vw, 1085px"
            quality={90}
            priority
            className="h-auto w-full rounded-2xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
