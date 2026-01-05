import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const startedAssessment = cookieStore.get('started-assessment')?.value

    if (startedAssessment) {
      return NextResponse.json({
        success: false,
        error: 'Assessment already started',
      })
    }

    const organizationKey = cookieStore.get('organization-key')?.value

    if (!organizationKey) {
      return NextResponse.json({
        success: false,
        error: 'Organization key not found',
      }, { status: 400 })
    }

    // Call backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-started?organizationKey=${organizationKey}`

    const response = await fetch(backendUrl, {
      method: 'POST',
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return NextResponse.json({
        success: false,
        error: `Backend API error: ${response.status} ${errorText}`,
      }, { status: response.status })
    }

    // Set cookie to mark as started
    cookieStore.set('started-assessment', 'true')

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

