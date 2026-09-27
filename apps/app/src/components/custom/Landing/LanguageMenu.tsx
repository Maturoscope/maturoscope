"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { AVAILABLE_LANGUAGES, type Locale } from "@/lib/locale"

interface LanguageMenuProps {
  lang: Locale
}

/**
 * Landing language selector. All six locales are offered (the landing isn't tied
 * to an organization) and each entry navigates to that locale's landing root.
 */
export default function LanguageMenu({ lang }: LanguageMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5]"
      >
        <Image src={`/icons/flag-${lang}.svg`} alt="" width={18} height={18} />
        {lang.toUpperCase()}
        <ChevronDown
          className={`h-4 w-4 text-[#525252] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[120px] overflow-hidden rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-lg"
        >
          {AVAILABLE_LANGUAGES.map((locale) => (
            <li key={locale} role="option" aria-selected={locale === lang}>
              <Link
                href={`/${locale}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-[#F5F5F5] ${
                  locale === lang ? "text-[#0A0A0A]" : "text-[#525252]"
                }`}
              >
                <Image src={`/icons/flag-${locale}.svg`} alt="" width={18} height={18} />
                {locale.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
