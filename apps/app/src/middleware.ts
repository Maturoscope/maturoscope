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
  // Skip middleware for Server Actions
  // In Next.js 15, Server Actions are POST requests to page routes with specific headers
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || ''
    const nextAction = request.headers.get('next-action')
    
    // Detect Server Actions by:
    // 1. Content-Type is text/plain (Server Actions use this)
    // 2. Has next-action header (Next.js internal header for Server Actions)
    // 3. Path includes _next (Next.js internal routes)
    // 4. Any POST to a locale route could be a Server Action
    if (
      contentType.includes('text/plain') ||
      nextAction ||
      request.nextUrl.pathname.includes('_next') ||
      request.nextUrl.pathname.includes('_action')
    ) {
      return NextResponse.next()
    }
    
    // For POST requests to locale routes, allow them through
    // They might be Server Actions even without the typical headers
    const pathname = request.nextUrl.pathname
    const pathnameHasLocale = LOCALES.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    
    if (pathnameHasLocale) {
      return NextResponse.next()
    }
  }

  const { pathname } = request.nextUrl
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  if (pathname === "/") {
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/404`, request.url))
}

export const config = {
  // Exclude Server Actions, API routes, static files, and Next.js internals
  // Server Actions are handled automatically by Next.js and should not be intercepted
  // The middleware function will handle POST requests (Server Actions) separately
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (HMR for webpack)
     * - favicon.ico (favicon file)
     * - icons (icon files)
     * - images (image files)
     * 
     * Note: POST requests (Server Actions) are handled in the middleware function itself
     * to allow them to pass through without redirection
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|icons|images).*)",
  ],
}
