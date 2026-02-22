import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/utils/authDecode'
import { createStructuredLogger } from '@/lib/structured-logger'

const logger = createStructuredLogger('organizations/avatar')

export async function PATCH(req: NextRequest) {
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

    // Get the form data (avatar file)
    const formData = await req.formData()
    const avatarFile = formData.get('file') as File
    
    if (!avatarFile) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'No file provided' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (!allowedTypes.includes(avatarFile.type)) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Invalid file type. Only JPG, PNG, and SVG are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (4MB)
    const maxSize = 4 * 1024 * 1024
    if (avatarFile.size > maxSize) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'File size exceeds 4MB limit.' 
      }, { status: 400 })
    }

    // Create FormData for the backend API
    const backendFormData = new FormData()
    backendFormData.append('file', avatarFile)

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

    // Forward the request to the backend API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for file upload

    const uploadResponse = await fetch(`${apiBaseUrl}/organizations/avatar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`,
        // Note: Don't set Content-Type for FormData
      },
      body: backendFormData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!uploadResponse.ok) {
      let errorData
      try {
        errorData = await uploadResponse.json()
      } catch {
        errorData = { error: `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}` }
      }
      return NextResponse.json({ 
        error: errorData.error || 'Failed to upload avatar',
        message: errorData.message || 'Avatar upload failed'
      }, { status: uploadResponse.status })
    }

    const result = await uploadResponse.json()
    return NextResponse.json(result)

  } catch (error) {
    logger.error('Error uploading avatar', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout',
        message: 'Avatar upload timed out'
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while uploading avatar'
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

    // Forward the DELETE request to the backend API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const deleteResponse = await fetch(`${apiBaseUrl}/organizations/avatar`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!deleteResponse.ok) {
      let errorData
      try {
        errorData = await deleteResponse.json()
      } catch {
        errorData = { error: `HTTP ${deleteResponse.status}: ${deleteResponse.statusText}` }
      }
      return NextResponse.json({ 
        error: errorData.error || 'Failed to remove avatar',
        message: errorData.message || 'Avatar removal failed'
      }, { status: deleteResponse.status })
    }

    const result = await deleteResponse.json()
    return NextResponse.json(result)

  } catch (error) {
    logger.error('Error removing avatar', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout',
        message: 'Avatar removal timed out'
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while removing avatar'
    }, { status: 500 })
  }
}
