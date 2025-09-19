import { NextResponse, NextRequest } from "next/server"

const LOCALES = ["en", "fr"]
const DEFAULT_LOCALE = "en"

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale)
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/404`, request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)"],
}
