import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('readiness-assessment/assess');

/**
 * PUBLIC endpoint - No authentication required
 * POST /api/readiness-assessment/assess?organizationKey=synoop
 * 
 * Assesses a readiness scale for an organization identified by its unique key
 * Used by public assessment tools
 */
export async function POST(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    logger.error('API base URL is not configured');
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get organizationKey from query parameter
    const organizationKey = request.nextUrl.searchParams.get('organizationKey');
    
    if (!organizationKey) {
      return NextResponse.json(
        { message: 'organizationKey query parameter is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Call the public backend endpoint (no authentication)
    const response = await fetch(
      `${apiBaseUrl}/readiness-assessment/assess?organizationKey=${encodeURIComponent(organizationKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.error || 'Failed to assess scale' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn('Request timeout assessing scale');
      return NextResponse.json(
        { message: 'Request timeout' },
        { status: 408 }
      );
    }

    logger.error('Error assessing scale', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

