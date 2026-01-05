import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get language from query params
    const { searchParams } = new URL(request.url)
    const lang = (searchParams.get('lang') || 'en') as 'en' | 'fr'
    
    // Call backend API
    // Note: Backend returns all questions with EN & FR translations
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/questions`
    
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
      const errorText = await response.text().catch(() => response.statusText)
      return NextResponse.json(
        { success: false, error: `Backend API error: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Transform backend response from { TRL: {...}, MkRL: {...}, MfRL: {...} }
    // to array format: [{ id: 'trl', questions: [...] }, ...]
    // Also transform each question from backend format to frontend format
    interface BackendQuestion {
      id: string
      question: { en: string; fr: string }
      levels: Record<string, { en: string; fr: string }>
    }
    
    const transformQuestions = (backendQuestions: BackendQuestion[]) => {
      return backendQuestions.map((q) => ({
        id: q.id,
        title: q.question[lang] || q.question.en, // Use requested language
        options: Object.entries(q.levels).map(([levelId, levelText]) => ({
          id: levelId,
          title: levelText[lang] || levelText.en,
        })),
      }))
    }
    
    const transformedData = [
      { 
        id: 'trl' as const, 
        name: 'TRL', 
        questions: data.TRL?.questions ? transformQuestions(data.TRL.questions) : [] 
      },
      { 
        id: 'mkrl' as const, 
        name: 'MkRL', 
        questions: data.MkRL?.questions ? transformQuestions(data.MkRL.questions) : [] 
      },
      { 
        id: 'mfrl' as const, 
        name: 'MfRL', 
        questions: data.MfRL?.questions ? transformQuestions(data.MfRL.questions) : [] 
      },
    ]
    
    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error('Error in /api/questions:', error)
    
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

