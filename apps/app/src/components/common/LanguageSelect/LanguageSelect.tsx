"use client"

// Packages
import Image from "next/image"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"
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
          <Link
            href={getLocaleUrl("en")}
            className="w-full h-8 flex items-center justify-start px-2 py-1.5 hover:bg-accent rounded-sm"
          >
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <Image
                src={`/icons/flag-en.svg`}
                alt={placeholder}
                width={16}
                height={16}
              />
              <SelectValue placeholder="EN" />
            </div>
          </Link>
          <Link
            href={getLocaleUrl("fr")}
            className="w-full h-8 flex items-center justify-start px-2 py-1.5 hover:bg-accent rounded-sm"
          >
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <Image
                src={`/icons/flag-fr.svg`}
                alt={placeholder}
                width={16}
                height={16}
              />
              <SelectValue placeholder="FR" />
            </div>
          </Link>
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelect
