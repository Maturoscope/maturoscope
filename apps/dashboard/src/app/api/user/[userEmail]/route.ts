import { NextRequest, NextResponse } from 'next/server'
import { createStructuredLogger } from '@/lib/structured-logger'

const logger = createStructuredLogger('user/[userEmail]')

async function handleUserUpdate(req: NextRequest, userEmail: string) {
  if (!userEmail || userEmail === 'undefined') {
    return NextResponse.json({ error: 'Invalid user email' }, { status: 400 })
  }

  const body = await req.json()

  // Validate required fields for profile update
  if (!body.firstName && !body.lastName && !body.picture && body.isActive === undefined) {
    return NextResponse.json({ 
      error: 'At least one field (firstName, lastName, picture, isActive) is required' 
    }, { status: 400 })
  }

  const cookies = req.cookies
  const token = cookies.get('token')

  if (!token || !token.value) {
    return NextResponse.json({ 
      error: 'Unauthorized', 
      message: 'No token found' 
    }, { status: 401 })
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${apiBaseUrl}/users/email/${encodeURIComponent(userEmail)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      return NextResponse.json({ 
        error: errorData.error || 'Failed to update user' 
      }, { status: response.status })
    }

    let updatedUser
    try {
      updatedUser = await response.json()
    } catch {
      return NextResponse.json({ 
        error: 'Invalid response format from backend' 
      }, { status: 500 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout' 
      }, { status: 408 })
    }
    return NextResponse.json({ 
      error: 'Network error occurred' 
    }, { status: 500 })
  }
}

async function handleUserGet(req: NextRequest, userEmail: string) {
  if (!userEmail || userEmail === 'undefined') {
    return NextResponse.json({ error: 'Invalid user email' }, { status: 400 })
  }

  const cookies = req.cookies
  const token = cookies.get('token')

  if (!token || !token.value) {
    return NextResponse.json({ 
      error: 'Unauthorized', 
      message: 'No token found' 
    }, { status: 401 })
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${apiBaseUrl}/users/email/${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      return NextResponse.json({ 
        error: errorData.error || 'Failed to fetch user' 
      }, { status: response.status })
    }

    let user
    try {
      user = await response.json()
    } catch {
      return NextResponse.json({ 
        error: 'Invalid response format from backend' 
      }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout' 
      }, { status: 408 })
    }
    return NextResponse.json({ 
      error: 'Network error occurred' 
    }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const { userEmail } = await params
    return await handleUserUpdate(req, userEmail)
  } catch (error) {
    logger.error('Error in PATCH route', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const { userEmail } = await params
    return await handleUserGet(req, userEmail)
  } catch (error) {
    logger.error('Error fetching user', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}