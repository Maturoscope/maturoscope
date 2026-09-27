"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import type { Locale } from "@/lib/locale"
import type { LandingDictionary } from "@/dictionaries/landing"
import { SECTION_IDS, questionnaireHref } from "./constants"
import LanguageMenu from "./LanguageMenu"

interface HeaderProps {
  lang: Locale
  dict: LandingDictionary["header"]
}

export default function Header({ lang, dict }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Lock background scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  const navLinks = [
    { href: `#${SECTION_IDS.hosts}`, label: dict.hosts },
    { href: `#${SECTION_IDS.whyMaturoscope}`, label: dict.whyMaturoscope },
    { href: `#${SECTION_IDS.whatWeMeasure}`, label: dict.whatWeMeasure },
    { href: `#${SECTION_IDS.whatYouGet}`, label: dict.whatYouGet },
  ]

  const cta = questionnaireHref(lang)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between px-5 md:px-10">
        <Link href={`/${lang}`} className="text-xl font-bold text-[#0A0A0A]">
          Maturoscope.
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#0A0A0A] transition-colors hover:text-[#0A0A0A]/60"
            >
              {link.label}
            </a>
          ))}
          <a
            href={cta}
            className="rounded-lg bg-[#C0410F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A6380D]"
          >
            {dict.cta}
          </a>
          <LanguageMenu lang={lang} />
        </nav>

        {/* Mobile: language selector (only while the menu is open) + toggle */}
        <div className="flex items-center gap-3 md:hidden">
          {menuOpen && <LanguageMenu lang={lang} />}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="text-[#0A0A0A]"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <nav className="fixed inset-x-0 bottom-0 top-[68px] z-40 flex flex-col gap-1 overflow-y-auto bg-white px-5 py-6 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-3 text-base font-medium text-[#0A0A0A] hover:bg-gray-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href={cta}
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-lg bg-[#C0410F] px-5 py-3 text-center text-sm font-semibold text-white"
          >
            {dict.cta}
          </a>
        </nav>
      )}
    </header>
  )
}
