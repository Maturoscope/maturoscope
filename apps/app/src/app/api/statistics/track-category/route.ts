import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, level } = body

    if (!category || level === undefined || level === null) {
      return NextResponse.json({
        success: false,
        error: 'Category and level are required',
      }, { status: 400 })
    }

    // Validate category is one of the expected values
    const validCategories = ['TRL', 'MkRL', 'MfRL']
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      }, { status: 400 })
    }

    // Validate level is a number between 1-9
    const levelNum = Number(level)
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 9) {
      return NextResponse.json({
        success: false,
        error: 'Level must be a number between 1 and 9',
      }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookieKey = `tracked-category-${category}`
    const trackedCategory = cookieStore.get(cookieKey)?.value

    if (trackedCategory) {
      return NextResponse.json({
        success: false,
        error: `Category ${category} already tracked`,
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/statistics/track-category?organizationKey=${organizationKey}`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, level: levelNum }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return NextResponse.json({
        success: false,
        error: `Backend API error: ${response.status} ${errorText}`,
      }, { status: response.status })
    }

    // Set cookie to mark as tracked
    cookieStore.set(cookieKey, 'true')

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

