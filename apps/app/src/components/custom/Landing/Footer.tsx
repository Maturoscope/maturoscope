"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Locale } from "@/lib/locale"
import type { LandingDictionary } from "@/dictionaries/landing"
import PrivacyPolicyModal from "@/components/common/PrivacyPolicyModal/PrivacyPolicyModal"
import { SECTION_IDS, CONTACT_EMAIL } from "./constants"

interface FooterProps {
  lang: Locale
  dict: LandingDictionary["footer"]
  nav: LandingDictionary["header"]
  disclaimer: string
  privacyPolicyModal: {
    title: string
    lastUpdatedLabel: string
  }
}

const NOBATEK_URL = "https://www.nobatek.com/"
const SYNOPP_URL = "https://synopp.io/"

export default function Footer({
  lang,
  dict,
  nav,
  disclaimer,
  privacyPolicyModal,
}: FooterProps) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  const navLinks = [
    { href: `#${SECTION_IDS.hosts}`, label: nav.hosts },
    { href: `#${SECTION_IDS.whyMaturoscope}`, label: nav.whyMaturoscope },
    { href: `#${SECTION_IDS.whatWeMeasure}`, label: nav.whatWeMeasure },
    { href: `#${SECTION_IDS.whatYouGet}`, label: nav.whatYouGet },
  ]

  const mailto = `mailto:${CONTACT_EMAIL}?subject=Contact%20from%20Maturoscope`

  return (
    <>
      <footer className="w-full border-t border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-[1360px] px-5 py-16 md:px-10">
          {/* Top: brand + link columns */}
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <Link href={`/${lang}`} className="text-2xl font-bold text-[#0A0A0A]">
              Maturoscope.
            </Link>

            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div>
                <h3 className="text-sm font-medium text-[#A3A3A3]">{dict.navigate}</h3>
                <ul className="mt-4 space-y-3">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-[15px] font-medium text-[#0A0A0A] transition-colors hover:text-[#0A0A0A]/60"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#A3A3A3]">{dict.legal}</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <button
                      type="button"
                      onClick={() => setIsPrivacyOpen(true)}
                      className="text-[15px] font-medium text-[#0A0A0A] transition-colors hover:text-[#0A0A0A]/60"
                    >
                      {dict.privacyPolicy}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom: funding disclaimer + credits */}
          <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <Image
                src="/icons/homepage/flag-europe.svg"
                alt="European Union flag"
                width={72}
                height={48}
                className="shrink-0"
              />
              <p className="max-w-[680px] text-xs leading-relaxed text-[#A3A3A3]">
                {disclaimer}
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <a
                href={mailto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[#0A0A0A] hover:underline"
              >
                {dict.contactUs}
              </a>
              <p className="text-sm text-[#A3A3A3]">
                {dict.madeBy}{" "}
                <a
                  href={NOBATEK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#525252] underline"
                >
                  Nobatek
                </a>
                . {dict.developedBy}{" "}
                <a
                  href={SYNOPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#525252] underline"
                >
                  Synopp
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        setIsOpen={setIsPrivacyOpen}
        lang={lang}
        title={privacyPolicyModal.title}
        lastUpdatedLabel={privacyPolicyModal.lastUpdatedLabel}
      />
    </>
  )
}
