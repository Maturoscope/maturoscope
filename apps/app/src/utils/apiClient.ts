/**
 * API Client utilities to call Next.js API Routes
 * These replace Server Actions for better stability in production
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Generic API client function
 */
async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return {
        success: false,
        error: `API error: ${response.status} ${errorText}`,
      }
    }

    const responseData = await response.json()
    
    // If the endpoint already returns { success, data }, return as-is
    // Otherwise, wrap it
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      return responseData
    }
    
    return { success: true, data: responseData }
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Submit assessment
 */
export async function submitAssessmentApi(
  scale: string,
  answers: Record<string, string>
): Promise<ApiResponse> {
  return apiClient('/api/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({ scale, answers }),
  })
}

/**
 * Request contact with services
 */
export async function requestContactApi(params: {
  gaps: Array<{
    questionId: string
    level: number
    recommendedServices: string[]
  }>
  contactInformation: {
    organization?: string
    country?: string
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    additionalInformation?: string
  }
  projectName: string
}): Promise<ApiResponse> {
  return apiClient('/api/services/contact', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * Generate PDF report
 */
export async function generateReportApi(
  lang: string,
  payload: unknown
): Promise<ApiResponse<string>> {
  try {
    const response = await fetch('/api/report/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lang, payload }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return {
        success: false,
        error: `API error: ${response.status} ${errorText}`,
      }
    }

    const apiResponse = await response.json()
    
    // The API route returns { success, data } where data is the base64 string
    // If response has success field, return as-is, otherwise wrap
    if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
      return apiResponse
    }
    
    return {
      success: true,
      data: apiResponse.data || apiResponse,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get questions with translations
 */
export async function getQuestionsApi(lang: string): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetch(`/api/questions?lang=${lang}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return {
        success: false,
        error: `API error: ${response.status} ${errorText}`,
      }
    }

    const apiResponse = await response.json()
    if (apiResponse.success) {
      return { success: true, data: apiResponse.data }
    }

    return {
      success: false,
      error: apiResponse.error || 'Failed to fetch questions',
    }
  } catch (error) {
    console.error('Error calling /api/questions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get risks
 */
export async function getRisksApi(params: {
  levels: { trl: number; mkrl: number; mfrl: number }
  phases: { trl: string; mkrl: string; mfrl: string }
}): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetch('/api/risks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      return {
        success: false,
        error: `API error: ${response.status} ${errorText}`,
      }
    }

    const apiResponse = await response.json()
    if (apiResponse.success) {
      return { success: true, data: apiResponse.data }
    }

    return {
      success: false,
      error: apiResponse.error || 'Failed to fetch risks',
    }
  } catch (error) {
    console.error('Error calling /api/risks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get organization signature
 */
export async function getOrganizationSignatureApi(): Promise<ApiResponse<string | null>> {
  try {
    const response = await fetch('/api/organization/signature', {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      return { success: true, data: null }
    }

    const apiResponse = await response.json()
    if (apiResponse.success) {
      return { success: true, data: apiResponse.data }
    }

    return { success: true, data: null }
  } catch (error) {
    console.error('Error calling /api/organization/signature:', error)
    return { success: true, data: null }
  }
}

/**
 * Track completed assessment
 */
export async function trackCompletedAssessmentApi(): Promise<ApiResponse> {
  return apiClient('/api/statistics/track-completed', {
    method: 'POST',
  })
}

/**
 * Track completed category
 */
export async function trackCompletedCategoryApi(
  category: 'TRL' | 'MkRL' | 'MfRL',
  level: number
): Promise<ApiResponse> {
  return apiClient('/api/statistics/track-category', {
    method: 'POST',
    body: JSON.stringify({ category, level }),
  })
}

