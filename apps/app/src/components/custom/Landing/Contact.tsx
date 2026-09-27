"use client"

import { motion } from "motion/react"
import type { LandingDictionary } from "@/dictionaries/landing"
import { CONTACT_EMAIL } from "./constants"

interface ContactProps {
  dict: LandingDictionary["contact"]
}

/**
 * Full-bleed peach banner inviting organizations to join the network. The
 * "Contact Us" button opens a pre-filled email to the Maturoscope team.
 */
export default function Contact({ dict }: ContactProps) {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Joining the Maturoscope network",
  )}`

  return (
    <section className="w-full bg-[#fed7aa]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10 md:py-14"
      >
        <div className="flex items-center gap-6 md:gap-10">
          <span
            aria-hidden
            className="text-[64px] font-bold leading-none text-[#7c2d12] md:text-[84px]"
          >
            M.
          </span>
          <div>
            <h2 className="text-2xl font-bold leading-tight tracking-[-0.01em] text-[#7c2d12] sm:text-3xl lg:text-4xl">
              {dict.title}
            </h2>
            <p className="mt-2 text-lg font-semibold text-[#7c2d12]/60">
              {dict.subtitle}
            </p>
          </div>
        </div>

        <a
          href={mailto}
          className="shrink-0 self-start rounded-lg bg-[#7c2d12] px-6 py-2.5 text-sm font-medium text-[#fafafa] shadow-sm transition-opacity hover:opacity-90 md:self-auto"
        >
          {dict.cta}
        </a>
      </motion.div>
    </section>
  )
}
