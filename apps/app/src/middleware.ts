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

  // Check for organization key in query params and set it in cookies
  const key = request.nextUrl.searchParams.get("key")
  const locale = getLocale(request)
  const response = pathnameHasLocale
    ? NextResponse.next()
    : pathname === "/"
    ? NextResponse.redirect(new URL(`/${locale}`, request.url))
    : NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))

  if (key) {
    // Set organization key in cookie (expires in 7 days)
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
    response.cookies.set("organization-key", key, {
      expires: expires,
      path: "/",
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)"],
}
