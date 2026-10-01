"use client"

import { Fragment } from "react"
import { motion } from "motion/react"
import type { LandingDictionary } from "@/dictionaries/landing"
import { SECTION_IDS } from "./constants"

interface WhatYouGetProps {
  dict: LandingDictionary["whatYouGet"]
}

/**
 * Renders a step description where phrases wrapped in **double asterisks** are
 * emphasized (near-black) and the rest is muted grey, matching the design's
 * two-tone copy. Splitting on "**" yields alternating segments; odd indices are
 * the emphasized ones.
 */
function EmphasizedText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((segment, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-[#171717]">
            {segment}
          </span>
        ) : (
          <Fragment key={i}>{segment}</Fragment>
        ),
      )}
    </>
  )
}

export default function WhatYouGet({ dict }: WhatYouGetProps) {
  return (
    <section id={SECTION_IDS.whatYouGet} className="w-full py-16 md:py-24">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-10">
        {/* Left: heading */}
        <div>
          <span className="inline-block rounded-full bg-[#F5F5F5] px-3 py-1 text-sm font-medium text-[#525252]">
            {dict.badge}
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[#0A0A0A] sm:text-5xl lg:text-[52px]">
            {dict.title}
          </h2>
          <p className="mt-6 max-w-[460px] text-base leading-relaxed text-[#525252]">
            {dict.subtitle}
          </p>
        </div>

        {/* Right: numbered timeline */}
        <ol className="relative">
          {dict.steps.map((step, i) => {
            const isLast = i === dict.steps.length - 1
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Connector line to the next step */}
                {!isLast && (
                  <span className="absolute left-[35px] top-[72px] bottom-0 w-px bg-[#F1873C]/40" />
                )}
                <div className="relative z-10 flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-[#F1873C] bg-white text-2xl font-medium text-[#C0410F]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pt-3">
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#737373]">
                    <EmphasizedText text={step.description} />
                  </p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
