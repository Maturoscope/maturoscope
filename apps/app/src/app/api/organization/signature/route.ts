import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get organization key from cookies
    const cookieStore = await cookies()
    const organizationKey = cookieStore.get('organization-key')?.value

    if (!organizationKey) {
      return NextResponse.json({ success: true, data: null })
    }

    // Call backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/organizations/key/${organizationKey}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

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
      return NextResponse.json({ success: true, data: null })
    }

    const organization = await response.json()
    const signature = organization?.signature || null

    return NextResponse.json({ success: true, data: signature })
  } catch (error) {
    console.error('Error in /api/organization/signature:', error)
    return NextResponse.json({ success: true, data: null })
  }
}

