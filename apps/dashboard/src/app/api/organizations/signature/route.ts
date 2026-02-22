import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('organizations/signature');

export async function PATCH(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Authentication token not found' 
      }, { status: 401 });
    }

    // Parse the form data
    const formData = await req.formData();
    const signatureFile = formData.get('file') as File;

    if (!signatureFile) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(signatureFile.type)) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (signatureFile.size > maxSize) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'File size too large. Maximum size is 4MB.' 
      }, { status: 400 });
    }

    // Forward to backend API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    const backendFormData = new FormData();
    backendFormData.append('file', signatureFile);

    const uploadResponse = await fetch(`${apiBaseUrl}/organizations/signature`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: backendFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error || 'Upload Failed', 
        message: errorData.message || `Backend responded with status ${uploadResponse.status}` 
      }, { status: uploadResponse.status });
    }

    const result = await uploadResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Error uploading signature', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request Timeout', 
        message: 'Upload request timed out' 
      }, { status: 408 });
    }

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: 'Failed to upload signature' 
    }, { status: 500 });
  }
}

export async function DELETE() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Authentication token not found' 
      }, { status: 401 });
    }

    // Forward to backend API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    const deleteResponse = await fetch(`${apiBaseUrl}/organizations/signature`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error || 'Delete Failed', 
        message: errorData.message || `Backend responded with status ${deleteResponse.status}` 
      }, { status: deleteResponse.status });
    }

    const result = await deleteResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Error removing signature', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request Timeout', 
        message: 'Delete request timed out' 
      }, { status: 408 });
    }

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: 'Failed to remove signature' 
    }, { status: 500 });
  }
}
