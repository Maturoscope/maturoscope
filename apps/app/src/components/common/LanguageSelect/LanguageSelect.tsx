"use client"

// Packages
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useParams, useSearchParams } from "next/navigation"
// Locale
import { Locale, AVAILABLE_LANGUAGES, resolveLocale } from "@/lib/locale"
// Components
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const getKeyFromCookie = (): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)organization-key=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

const LanguageSelect = () => {
  const { lang } = useParams<{ lang: Locale }>()
  const placeholder = lang.toUpperCase()
  const currPathname = usePathname()
  const searchParams = useSearchParams()
  const pathWithoutLocale = currPathname.split("/").slice(2)

  // Only the organization's Live languages are offered to the visitor. Start
  // with the current locale so the selector is never empty while loading.
  const [availableLocales, setAvailableLocales] = useState<Locale[]>([lang])

  useEffect(() => {
    const key = searchParams.get("key") || getKeyFromCookie()
    if (!key) return
    let cancelled = false

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/languages/public/${key}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { languages?: string[] } | null) => {
        if (cancelled || !data?.languages) return
        const live = data.languages.map(resolveLocale)
        // Guarantee the current locale is present and keep the canonical order.
        const set = new Set<Locale>([...live, lang])
        setAvailableLocales(AVAILABLE_LANGUAGES.filter((l) => set.has(l)))
      })
      .catch(() => {
        // Best-effort: keep just the current locale on failure.
      })

    return () => {
      cancelled = true
    }
  }, [searchParams, lang])

  const getLocaleUrl = (locale: Locale) =>
    `/${locale}/${pathWithoutLocale.join("/")}`

  return (
    <div className="w-full max-w-[100px]">
      <Select>
        <SelectTrigger className="justify-center gap-2 cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <Image
              src={`/icons/flag-${lang}.svg`}
              alt={placeholder}
              width={16}
              height={16}
            />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="w-full min-w-[100px] max-w-[100px] flex flex-col gap-2">
          {availableLocales.map((locale) => (
            <Link
              key={locale}
              href={getLocaleUrl(locale)}
              className="w-full h-8 flex items-center justify-start px-2 py-1.5 hover:bg-foreground/5 rounded-sm"
            >
              <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                <Image
                  src={`/icons/flag-${locale}.svg`}
                  alt={locale.toUpperCase()}
                  width={16}
                  height={16}
                />
                <SelectValue placeholder={locale.toUpperCase()} />
              </div>
            </Link>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelect
