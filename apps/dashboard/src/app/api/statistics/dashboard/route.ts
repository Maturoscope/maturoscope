import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('statistics/dashboard');

/**
 * GET /api/statistics/dashboard
 * Get dashboard statistics for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    logger.error('API base URL is not configured');
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get auth token from cookies
    const token = request.cookies.get('token');

    if (!token || !token.value) {
      return NextResponse.json(
        { message: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${apiBaseUrl}/statistics/dashboard`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.error('Backend error fetching dashboard statistics', new Error((data as { message?: string }).message ?? 'Backend error'), {
        status: response.status,
      });
      return NextResponse.json(
        { 
          message: data.message || data.error || `Failed to fetch dashboard statistics (${response.status})`,
          statusCode: response.status,
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn('Request timeout fetching dashboard statistics');
      return NextResponse.json(
        { message: 'Request timeout' },
        { status: 408 }
      );
    }

    logger.error('Error fetching dashboard statistics', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

