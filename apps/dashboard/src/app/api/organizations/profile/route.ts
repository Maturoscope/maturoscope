import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // Parse the request body
    const body = await req.json();
    const { name, key, email } = body;

    if (!name || !key || !email) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'Name, key, and email are required' 
      }, { status: 400 });
    }

    // Forward to backend API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    const updateResponse = await fetch(`${apiBaseUrl}/organizations/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, key, email }),
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
    console.error('Error updating profile:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request Timeout', 
        message: 'Update request timed out' 
      }, { status: 408 });
    }

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: 'Failed to update profile' 
    }, { status: 500 });
  }
}
