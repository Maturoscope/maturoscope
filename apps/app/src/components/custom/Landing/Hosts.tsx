"use client"

import { motion } from "motion/react"
import type { PublicOrganization } from "@/actions/organization"
import { SECTION_IDS } from "./constants"

interface HostsProps {
  lang: string
  badge: string
  title: string
  subtitle: string
  selectLabel: string
  organizations: PublicOrganization[]
}

export default function Hosts({
  lang,
  badge,
  title,
  subtitle,
  selectLabel,
  organizations,
}: HostsProps) {
  if (organizations.length === 0) return null

  return (
    <section id={SECTION_IDS.hosts} className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-[1165px] px-5 md:px-10">
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#F5F5F5] px-3 py-1 text-sm font-medium text-[#525252]">
            {badge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-[#0A0A0A] sm:text-4xl lg:text-[44px]">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] text-base text-[#525252] md:text-lg">
            {subtitle}
          </p>
        </div>

        <p className="mt-12 text-center text-xs font-semibold uppercase tracking-wide text-[#A3A3A3]">
          {selectLabel}
        </p>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          {organizations.map((org) => (
            <motion.div
              key={org.key}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              className="w-[calc(50%-8px)] sm:w-[calc(33.333%-10.667px)] lg:w-[calc(20%-12.8px)]"
            >
              <a
                href={`/${lang}?key=${org.key}`}
                className="group flex h-[72px] items-center justify-center gap-3 rounded-xl border border-transparent bg-[#F5F5F5] px-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F1873C] hover:bg-[#FDEEDD]"
              >
                {org.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={org.avatar}
                    alt={org.name}
                    className="h-7 w-7 shrink-0 rounded object-cover opacity-60 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-xs font-semibold text-gray-600 transition-colors group-hover:bg-[#F1873C] group-hover:text-white">
                    {org.name?.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate text-sm font-medium text-[#0A0A0A]">
                  {org.name}
                </span>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
