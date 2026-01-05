import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lang, payload } = body

    if (!lang || !payload) {
      return NextResponse.json(
        { success: false, error: 'Language and payload are required' },
        { status: 400 }
      )
    }

    // Get organization key from cookies
    const cookieStore = await cookies()
    const organizationKey = cookieStore.get('organization-key')?.value

    // Build backend URL
    let backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/report/${lang}`
    if (organizationKey) {
      backendUrl += `?organizationKey=${organizationKey}`
    }

    // Call backend API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return NextResponse.json(
        { success: false, error: `Failed to generate PDF: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    // Convert the PDF response to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return NextResponse.json({ success: true, data: base64 })
  } catch (error) {
    console.error('Error in /api/report/generate:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'PDF generation timeout - please try again' },
          { status: 504 }
        )
      }
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { success: false, error: 'Network error - please check your connection' },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
