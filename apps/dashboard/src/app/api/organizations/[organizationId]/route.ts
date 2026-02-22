import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/utils/authDecode'
import { createStructuredLogger } from '@/lib/structured-logger'

const logger = createStructuredLogger('organizations/[organizationId]')

async function handleOrganizationUpdate(req: NextRequest, organizationId: string) {
  const cookies = req.cookies
  const token = cookies.get('token')

  if (!token || !token.value) {
    return NextResponse.json({ 
      error: 'Unauthorized', 
      message: 'No token found' 
    }, { status: 401 })
  }

  try {
    const decoded = await verifyToken(token.value)
    
    if (!decoded.userEmail) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      }, { status: 401 })
    }

    const body = await req.json()
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(`${apiBaseUrl}/organizations/${encodeURIComponent(organizationId)}`, {
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
        error: errorData.error || 'Failed to update organization' 
      }, { status: response.status })
    }

    const organization = await response.json()
    return NextResponse.json(organization)

  } catch (error) {
    logger.error('Error updating organization', error, { organizationId })
    
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

async function handleOrganizationGet(req: NextRequest, organizationId: string) {
  const cookies = req.cookies
  const token = cookies.get('token')

  if (!token || !token.value) {
    return NextResponse.json({ 
      error: 'Unauthorized', 
      message: 'No token found' 
    }, { status: 401 })
  }

  try {
    const decoded = await verifyToken(token.value)
    
    if (!decoded.userEmail) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      }, { status: 401 })
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(`${apiBaseUrl}/organizations/${encodeURIComponent(organizationId)}`, {
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
        error: errorData.error || 'Failed to fetch organization' 
      }, { status: response.status })
    }

    const organization = await response.json()
    return NextResponse.json(organization)

  } catch (error) {
    logger.error('Error fetching organization', error, { organizationId })
    
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
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params
  return handleOrganizationUpdate(req, organizationId)
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params
  return handleOrganizationGet(req, organizationId)
}
