import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { levels, phases } = body

    if (!levels || !phases) {
      return NextResponse.json(
        { success: false, error: 'Levels and phases are required' },
        { status: 400 }
      )
    }

    // Transform frontend format to backend format
    // From: { levels: { trl: 1, mkrl: 2, mfrl: 3 }, phases: { trl: '1', mkrl: '1', mfrl: '2' } }
    // To: { scales: [{ scale: 'TRL', readinessLevel: 1, phase: 1 }, ...] }
    const scales = [
      { scale: 'TRL' as const, readinessLevel: levels.trl, phase: Number(phases.trl) },
      { scale: 'MkRL' as const, readinessLevel: levels.mkrl, phase: Number(phases.mkrl) },
      { scale: 'MfRL' as const, readinessLevel: levels.mfrl, phase: Number(phases.mfrl) },
    ]

    // Call backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/analyze-risk`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scales }),
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

    const backendData = await response.json()
    
    // Transform backend response from array of risks
    // To: { trl: {...}, mkrl: {...}, mfrl: {...} }
    interface RiskItem {
      scale: string
      readinessLevel: number
      phase: number
      isLowest: boolean
      strategicFocus?: { en: string; fr: string }
      primaryRisk?: { en: string; fr: string }
    }
    
    interface TransformedRisk {
      readinessLevel: number
      phase: number
      isLowest: boolean
      strategicFocus?: { en: string; fr: string }
      primaryRisk?: { en: string; fr: string }
    }
    
    const transformedData: Record<string, TransformedRisk> = {}
    
    if (backendData.risks && Array.isArray(backendData.risks)) {
      backendData.risks.forEach((risk: RiskItem) => {
        const scaleKey = risk.scale.toLowerCase() as 'trl' | 'mkrl' | 'mfrl'
        transformedData[scaleKey] = {
          readinessLevel: risk.readinessLevel,
          phase: risk.phase,
          isLowest: risk.isLowest,
          strategicFocus: risk.strategicFocus,
          primaryRisk: risk.primaryRisk,
        }
      })
    }
    
    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error('Error in /api/risks:', error)
    
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

