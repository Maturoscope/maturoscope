import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scale, answers } = body

    if (!scale || !answers) {
      return NextResponse.json(
        { success: false, error: 'Scale and answers are required' },
        { status: 400 }
      )
    }

    // Get organization key from cookies
    const cookieStore = await cookies()
    const organizationKey = cookieStore.get('organization-key')?.value

    if (!organizationKey) {
      return NextResponse.json(
        { success: false, error: 'Organization key not found' },
        { status: 400 }
      )
    }

    // Call backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/assess?organizationKey=${organizationKey}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scale, answers }),
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return NextResponse.json(
        { success: false, error: `Backend API error: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in /api/assessment/submit:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout' },
          { status: 504 }
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
