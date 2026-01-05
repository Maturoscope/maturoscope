import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const DEFAULT_ACCENT_THEME = 'default'
const DEFAULT_FONT_THEME = 'geist'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const organizationKey = cookieStore.get('organization-key')?.value

    if (!organizationKey) {
      return NextResponse.json({
        success: true,
        data: {
          accentColor: DEFAULT_ACCENT_THEME,
          font: DEFAULT_FONT_THEME,
        },
      })
    }

    // Call backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/organizations/key/${organizationKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        data: {
          accentColor: DEFAULT_ACCENT_THEME,
          font: DEFAULT_FONT_THEME,
        },
      })
    }

    const organization = await response.json()
    const { theme: accentColor, font } = organization

    return NextResponse.json({
      success: true,
      data: {
        accentColor: accentColor || DEFAULT_ACCENT_THEME,
        font: font || DEFAULT_FONT_THEME,
      },
    })
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        accentColor: DEFAULT_ACCENT_THEME,
        font: DEFAULT_FONT_THEME,
      },
    })
  }
}

