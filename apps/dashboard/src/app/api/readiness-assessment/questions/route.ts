import { NextResponse } from 'next/server';

/**
 * PUBLIC endpoint - No authentication required
 * GET /api/readiness-assessment/questions
 * 
 * Returns all questions for all scales (TRL, MkRL, MfRL)
 * Used by public assessment tools
 */
export async function GET() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Call the public backend endpoint (no authentication)
    const response = await fetch(
      `${apiBaseUrl}/readiness-assessment/questions`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.error || 'Failed to fetch questions' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Request timeout' },
        { status: 408 }
      );
    }

    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

