"use client"

// Packages
import Image from "next/image"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
// Locale
import { Locale, AVAILABLE_LANGUAGES } from "@/lib/locale"
// Components
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LanguageSelect = () => {
  const { lang } = useParams<{ lang: Locale }>()
  const placeholder = lang.toUpperCase()
  const currPathname = usePathname()
  const pathWithoutLocale = currPathname.split("/").slice(2)

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
          {AVAILABLE_LANGUAGES.map((locale) => (
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
