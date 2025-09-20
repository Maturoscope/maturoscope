import { NextResponse, NextRequest } from "next/server"
import { Locale } from "./dictionaries/dictionaries"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

const headers = { "accept-language": "en,es;q=0.5" }
const languages = new Negotiator({ headers }).languages()

const LOCALES: Locale[] = ["en", "fr"]
const DEFAULT_LOCALE = "en"

match(languages, LOCALES, DEFAULT_LOCALE)

const getLocale = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return pathname

  return DEFAULT_LOCALE
}

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  if (pathname === "/") {
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/404`, request.url))
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)"],
}
