import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear all tracking cookies
    cookieStore.delete('started-assessment')
    cookieStore.delete('completed-assessment')
    cookieStore.delete('tracked-category-TRL')
    cookieStore.delete('tracked-category-MkRL')
    cookieStore.delete('tracked-category-MfRL')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

