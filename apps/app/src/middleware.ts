import { NextResponse, NextRequest } from "next/server"
import { Locale } from "./dictionaries/dictionaries"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

const headers = { "accept-language": "en,es;q=0.5" }
const languages = new Negotiator({ headers }).languages()

const LOCALES: Locale[] = ["en", "fr"]
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

const validateOrganizationKey = async (key: string, organizationKeyFromCookie: string | null): Promise<boolean> => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/organizations/key/${key}${organizationKeyFromCookie ? `?organizationKey=${organizationKeyFromCookie}` : ""}`
    const response = await fetch(endpoint, {
      cache: 'no-store', // Ensure we don't cache the validation
    })

    if (!response.ok) {
      return false
    }

    const organization = await response.json()
    // Check if organization exists and is a valid object with properties
    // Also check for error responses that might be valid JSON but indicate failure
    if (!organization || typeof organization !== 'object') {
      return false
    }

    // Check for common error indicators
    if (organization.error || organization.message || organization.status === 'error') {
      return false
    }

    // Organization should have at least some identifying properties
    return Object.keys(organization).length > 0
  } catch (error) {
    console.error("Error validating organization key:", error)
    return false
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

  // Determine which key to use (prefer URL, fallback to cookie)
  const key = keyFromUrl || keyFromCookie

  // If no key found, redirect to 404
  if (!key) {
    const locale = getLocale(request)
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = `/${locale}/404`
    notFoundUrl.search = '' // Clear query params
    return NextResponse.redirect(notFoundUrl)
  }

  // Validate the key exists in the database
  const isValidKey = await validateOrganizationKey(key, keyFromCookie)

  // If key is invalid, redirect to 404
  if (!isValidKey) {
    const locale = getLocale(request)
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = `/${locale}/404`
    notFoundUrl.search = '' // Clear query params
    return NextResponse.redirect(notFoundUrl)
  }

  // Handle locale redirects
  const locale = getLocale(request)

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
    response = NextResponse.next()
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)"],
}
