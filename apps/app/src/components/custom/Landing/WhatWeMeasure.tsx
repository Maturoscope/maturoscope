"use client"

import { useEffect, useRef, useState } from "react"
import { Lightbulb, Store, Settings, type LucideIcon } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import type { LandingDictionary } from "@/dictionaries/landing"
import { SECTION_IDS, questionnaireHref } from "./constants"

interface WhatWeMeasureProps {
  lang: string
  dict: LandingDictionary["whatWeMeasure"]
}

type Scale = LandingDictionary["whatWeMeasure"]["scales"][number]

// The three maturity scales share their icon by position with the design.
const ICONS: LucideIcon[] = [Lightbulb, Store, Settings]

/**
 * "What we measure". Desktop pins the section and scrolls the row of scale cards
 * horizontally. Mobile — where a sideways scroll feels awkward — swaps to a
 * stacked-cards effect: each card sticks and the next one slides up to pile on
 * top of it as you scroll down.
 */
export default function WhatWeMeasure({ lang, dict }: WhatWeMeasureProps) {
  return (
    <section id={SECTION_IDS.whatWeMeasure} className="w-full">
      <div className="hidden md:block">
        <DesktopMeasure lang={lang} dict={dict} />
      </div>
      <div className="md:hidden">
        <MobileMeasure lang={lang} dict={dict} />
      </div>
    </section>
  )
}

/** Header shared by both layouts: badge, title and the CTA button. */
function MeasureHeader({ lang, dict }: WhatWeMeasureProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-10">
      <div>
        <span className="inline-block rounded-full bg-[#F5F5F5] px-3 py-1 text-sm font-medium text-[#525252]">
          {dict.badge}
        </span>
        <h2 className="mt-4 max-w-[620px] text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-4xl lg:text-[44px]">
          {dict.title}
        </h2>
      </div>
      <a
        href={questionnaireHref(lang)}
        className="shrink-0 self-start rounded-lg bg-[#C0410F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A6380D] md:self-auto"
      >
        {dict.cta}
      </a>
    </div>
  )
}

/** Icon + copy + faint background icon, shared by both card layouts. */
function CardBody({ scale, Icon }: { scale: Scale; Icon: LucideIcon }) {
  return (
    <>
      <Icon className="relative z-10 h-6 w-6 shrink-0 text-[#C0410F]" strokeWidth={2} />
      <div className="relative z-10 ml-6 max-w-[330px]">
        <h3 className="text-lg font-bold text-[#0A0A0A]">{scale.title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#525252]">
          {scale.description}
        </p>
      </div>
      <Icon
        className="pointer-events-none absolute -bottom-4 right-6 h-[148px] w-[148px] text-[#E5E5E5]"
        strokeWidth={1.25}
      />
    </>
  )
}

/** Desktop: pinned section, cards scroll horizontally with vertical scroll. */
function DesktopMeasure({ lang, dict }: WhatWeMeasureProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  // Measure how far the track overflows the viewport so we translate exactly
  // that much (last card ends flush at the right edge). Recomputed on resize.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      const overflow = track.scrollWidth - track.clientWidth
      setDistance(overflow > 0 ? overflow : 0)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])

  // Extra vertical room proportional to the horizontal travel gives a natural
  // scroll speed; when nothing overflows the section is just one viewport tall.
  const sectionHeight = distance > 0 ? `calc(100svh + ${distance}px)` : "100svh"

  return (
    <div ref={sectionRef} style={{ height: sectionHeight }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <MeasureHeader lang={lang} dict={dict} />

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-16 flex gap-6 pl-[calc(max(2.5rem,(100vw-1360px)/2+2.5rem)+184px)]"
        >
          {dict.scales.map((scale, i) => (
            <div
              key={scale.title}
              className="relative flex h-[249px] w-[min(550px,84vw)] shrink-0 overflow-hidden rounded-2xl bg-[#F5F5F5] p-9"
            >
              <CardBody scale={scale} Icon={ICONS[i] ?? Lightbulb} />
            </div>
          ))}
          {/* Trailing spacer (an element, unlike padding-right, is reliably
              counted in scrollWidth) so the last card ends flush with the
              container's right edge when fully scrolled. */}
          <div
            aria-hidden
            className="shrink-0 w-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))]"
          />
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Mobile: a plain static column of cards (no animation), one below the other, like
 * the other sections. Each card uses the vertical layout with the faint corner icon.
 */
function MobileMeasure({ lang, dict }: WhatWeMeasureProps) {
  return (
    <div className="pb-16 pt-14">
      <MeasureHeader lang={lang} dict={dict} />

      <div className="mx-auto mt-8 flex max-w-[1360px] flex-col gap-6 px-5">
        {dict.scales.map((scale, i) => {
          const Icon = ICONS[i] ?? Lightbulb
          return (
            <div
              key={scale.title}
              className="relative overflow-hidden rounded-2xl border border-[#EDEDED] bg-[#F5F5F5]"
            >
              {/* Faint oversized icon watermark in the top-right corner. */}
              <Icon
                className="pointer-events-none absolute -top-4 right-3 h-[104px] w-[104px] text-[#E9E9E9]"
                strokeWidth={1.25}
              />
              <div className="relative p-6">
                <Icon className="h-6 w-6 text-[#C0410F]" strokeWidth={2} />
                <h3 className="mt-4 max-w-[80%] text-lg font-bold leading-snug text-[#0A0A0A]">
                  {scale.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#525252]">
                  {scale.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
