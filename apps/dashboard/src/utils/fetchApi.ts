interface FetchApiOptions {
  endpoint: string
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: object
  headers?: Record<string, string>
}

interface FetchApiResponse<T = unknown> {
  data?: T
  error?: boolean
  message?: string
  status?: number
}

export async function fetchApi<T = unknown>({
  endpoint,
  method = 'GET',
  body,
  headers = {}
}: FetchApiOptions): Promise<FetchApiResponse<T>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    const url = `${baseUrl}${endpoint}`

    // Get token from cookies if running in browser
    let authHeaders = {}
    if (typeof window !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      
      if (token) {
        authHeaders = { Authorization: `Bearer ${token}` }
      }
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers
      },
      credentials: 'include',
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    config.signal = controller.signal

    const response = await fetch(url, config)
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: true,
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status
      }
    }

    const data = await response.json()
    return { data, error: false, status: response.status }

  } catch (error) {
    console.error('fetchApi error:', error)
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        error: true,
        message: 'Request timeout',
        status: 408
      }
    }
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Network error occurred',
      status: 500
    }
  }
}
