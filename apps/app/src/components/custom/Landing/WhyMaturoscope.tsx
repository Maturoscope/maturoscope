"use client"

import { useRef } from "react"
import { Lock, Timer, UsersRound, type LucideIcon } from "lucide-react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import type { LandingDictionary } from "@/dictionaries/landing"
import { SECTION_IDS } from "./constants"

// Feature cards share their icon by position with the design.
const FEATURE_ICONS: LucideIcon[] = [Lock, Timer, UsersRound]

interface WhyMaturoscopeProps {
  dict: LandingDictionary["whyMaturoscope"]
}

/**
 * Scroll-driven text reveal. The section is taller than the viewport and its
 * inner content is pinned (sticky) while it scrolls through. As the scroll
 * progresses, each word is "painted" from light grey to full black, one after
 * another, so reading and scrolling stay in sync.
 */
export default function WhyMaturoscope({ dict }: WhyMaturoscopeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Only paint while the text is pinned to the top of the viewport: progress
    // stays at 0 until the section fully covers the screen (so nothing is lit
    // before it's in view) and reaches 1 as the section scrolls out.
    offset: ["start start", "end end"],
  })

  const words = dict.body.split(" ")

  return (
    <>
      <section ref={containerRef} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-svh items-center">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <p className="flex flex-wrap text-3xl font-bold leading-[1.25] tracking-[-0.01em] sm:text-4xl lg:text-[44px] lg:leading-[1.3]">
              {words.map((word, i) => {
                const start = i / words.length
                const end = start + 1 / words.length
                return (
                  <Word key={i} progress={scrollYProgress} range={[start, end]}>
                    {word}
                  </Word>
                )
              })}
            </p>
          </div>
        </div>
      </section>

      <Features dict={dict} />
    </>
  )
}

function Features({ dict }: WhyMaturoscopeProps) {
  return (
    <section
      id={SECTION_IDS.whyMaturoscope}
      className="w-full bg-gradient-to-b from-[#FAFAFA] to-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#F5F5F5] px-3 py-1 text-sm font-medium text-[#525252]">
            {dict.badge}
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-[-0.02em] text-[#0A0A0A] sm:text-5xl lg:text-[52px]">
            {dict.title}
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3"
        >
          {dict.features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i] ?? Lock
            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl bg-[#F7F7F7] p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className="h-5 w-5 text-[#C0410F]" strokeWidth={2} />
                </div>
                <h3 className="mt-16 text-lg font-bold text-[#0A0A0A]">{feature.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#525252]">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

interface WordProps {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <span className="relative mr-[0.28em] mt-[0.1em]">
      <span className="absolute opacity-15">{children}</span>
      <motion.span style={{ opacity }} className="text-[#0A0A0A]">
        {children}
      </motion.span>
    </span>
  )
}
