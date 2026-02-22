import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('statistics/reports');

/**
 * GET /api/statistics/reports
 * Get aggregated statistics for super admin (all organizations or filtered by organizationId)
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
    const token = request.cookies.get('token');

    if (!token || !token.value) {
      logger.warn('Unauthorized access to reports statistics');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get organizationId from query params
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || undefined;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const url = new URL(`${apiBaseUrl}/statistics/reports`);
    if (organizationId) {
      url.searchParams.set('organizationId', organizationId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.error('Backend error fetching reports statistics', new Error((data as { message?: string }).message ?? 'Backend error'), {
        status: response.status,
      });
      return NextResponse.json(
        { message: data.message || data.error || 'Failed to fetch reports statistics' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn('Request timeout fetching reports statistics');
      return NextResponse.json(
        { message: 'Request timeout' },
        { status: 408 }
      );
    }

    logger.error('Error fetching reports statistics', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

