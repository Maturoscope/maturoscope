import { NextResponse, NextRequest } from "next/server"
import { Locale } from "./dictionaries/dictionaries"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { createStructuredLogger } from "./lib/structured-logger"

const logger = createStructuredLogger("middleware")

const headers = { "accept-language": "en,es;q=0.5" }
const languages = new Negotiator({ headers }).languages()

const LOCALES: Locale[] = ["en", "fr", "es", "it", "sl", "el"]
const DEFAULT_LOCALE = "en"

match(languages, LOCALES, DEFAULT_LOCALE)

const getLocale = (request: NextRequest): Locale => {
  const { pathname } = request.nextUrl

  // Check which locale is in the pathname and return it
  for (const locale of LOCALES) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }

  return DEFAULT_LOCALE
}

interface OrgLanguages {
  defaultLanguage: string
  languages: string[]
}

/**
 * Resolves the organization by key and returns its default + Live languages.
 * Doubles as key validation: a missing/invalid key yields null. One request
 * serves both the 404 guard and the locale fallback below.
 */
const fetchOrgLanguages = async (key: string): Promise<OrgLanguages | null> => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/languages/public/${key}`
    const response = await fetch(endpoint, { cache: "no-store" })
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    if (!data || typeof data !== "object" || !Array.isArray(data.languages)) {
      return null
    }
    return data as OrgLanguages
  } catch (error) {
    logger.error("Error resolving organization languages", error, { key })
    return null
  }
}

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Skip key validation for 404 page to prevent redirect loops
  // The 404 page is the ONLY page that doesn't require a key
  const is404Page = pathname.endsWith("/404")
  if (is404Page) {
    return NextResponse.next()
  }

  // Get organization key from URL query params
  const keyFromUrl = request.nextUrl.searchParams.get("key")
  // Get organization key from cookies
  const keyFromCookie = request.cookies.get("organization-key")?.value || null

  const locale = getLocale(request)
  const isLocaleRoot =
    pathname === "/" || LOCALES.some((l) => pathname === `/${l}`)

  // The locale root WITHOUT an explicit ?key is always the public landing page,
  // regardless of any stored organization-key cookie. This lets a returning
  // visitor (who may have a questionnaire in progress) reach the landing and
  // choose an organization. The cookie is only used to carry the key inside a
  // questionnaire's deeper routes (below).
  if (isLocaleRoot && !keyFromUrl) {
    if (pathname === `/${locale}`) {
      // Flag the request so the layout renders in landing mode (no questionnaire
      // header, full-page scroll) even when a cookie is present.
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-landing", "1")
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    const landingUrl = request.nextUrl.clone()
    landingUrl.pathname = `/${locale}`
    landingUrl.search = ""
    return NextResponse.redirect(landingUrl)
  }

  // Determine which key to use (prefer URL, fallback to cookie) for the flow.
  const key = keyFromUrl || keyFromCookie

  // A deeper flow route with no key at all → send them to the landing.
  if (!key) {
    const landingUrl = request.nextUrl.clone()
    landingUrl.pathname = `/${locale}`
    landingUrl.search = ""
    return NextResponse.redirect(landingUrl)
  }

  // Resolve org (validates the key) and its Live languages in one request.
  const orgLanguages = await fetchOrgLanguages(key)

  // If key is invalid, redirect to 404
  if (!orgLanguages) {
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = `/${locale}/404`
    notFoundUrl.search = '' // Clear query params
    return NextResponse.redirect(notFoundUrl)
  }

  // Fall back to the default language when the requested locale isn't Live for
  // this organization (e.g. a directly-typed URL for a draft/disabled language).
  if (
    pathnameHasLocale &&
    !orgLanguages.languages.includes(locale) &&
    locale !== orgLanguages.defaultLanguage
  ) {
    const target = request.nextUrl.clone()
    target.pathname = pathname.replace(
      `/${locale}`,
      `/${orgLanguages.defaultLanguage}`,
    )
    target.searchParams.set("key", key)
    return NextResponse.redirect(target)
  }

  // If key is in cookie but not in URL, we need to add it to URL
  if (keyFromCookie && !keyFromUrl) {
    // Create URL with key added
    const urlWithKey = new URL(request.url)
    urlWithKey.searchParams.set("key", keyFromCookie)

    // If pathname doesn't have locale, add it
    if (!pathnameHasLocale) {
      if (pathname === "/") {
        urlWithKey.pathname = `/${locale}`
      } else {
        urlWithKey.pathname = `/${locale}${pathname}`
      }
    }

    const response = NextResponse.redirect(urlWithKey)
    // Ensure cookie is set
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
    response.cookies.set("organization-key", keyFromCookie, {
      expires: expires,
      path: "/",
      sameSite: "lax",
    })
    return response
  }

  // Handle locale redirects (when key is already in URL)
  let response: NextResponse

  if (pathnameHasLocale) {
    // Expose the resolved organization key as a request header so the server
    // layout themes the very first paint with THIS host's colors/font. Reading
    // the cookie alone lags by one navigation (the Set-Cookie below only reaches
    // the browser on the next request), which showed the previous host's theme
    // until a manual reload.
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-organization-key", key)
    response = NextResponse.next({ request: { headers: requestHeaders } })
  } else if (pathname === "/") {
    const redirectUrl = new URL(`/${locale}`, request.url)
    // Preserve all query params including key
    request.nextUrl.searchParams.forEach((value, name) => {
      redirectUrl.searchParams.set(name, value)
    })
    response = NextResponse.redirect(redirectUrl)
  } else {
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url)
    // Preserve all query params including key
    request.nextUrl.searchParams.forEach((value, name) => {
      redirectUrl.searchParams.set(name, value)
    })
    response = NextResponse.redirect(redirectUrl)
  }

  // If key is in URL, ensure it's also in cookie
  if (keyFromUrl) {
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
    response.cookies.set("organization-key", keyFromUrl, {
      expires: expires,
      path: "/",
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images|landing).*)"],
}
