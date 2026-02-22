import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('organizations/language');

export async function PATCH(req: NextRequest) {
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

    // Parse the request body
    const body = await req.json();
    const { language } = body;

    if (!language) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Language is required' 
      }, { status: 400 });
    }

    // Validate language format (should be EN, FR, etc.)
    const allowedLanguages = ['EN', 'FR'];
    if (!allowedLanguages.includes(language)) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Invalid language. Allowed values: ' + allowedLanguages.join(', ') 
      }, { status: 400 });
    }

    // Forward to backend API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    const updateResponse = await fetch(`${apiBaseUrl}/organizations/language`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error || 'Update Failed', 
        message: errorData.message || `Backend responded with status ${updateResponse.status}` 
      }, { status: updateResponse.status });
    }

    const result = await updateResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Error updating language', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request Timeout', 
        message: 'Update request timed out' 
      }, { status: 408 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: 'Failed to update language' 
    }, { status: 500 });
  }
}
