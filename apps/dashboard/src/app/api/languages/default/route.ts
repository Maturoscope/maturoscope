import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';
import { buildApiHeaders } from '@/lib/apiProxy';

const logger = createStructuredLogger('languages/default');

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    logger.error('API base URL is not configured');
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiBaseUrl}/languages/default`, {
      method: 'PATCH',
      headers: buildApiHeaders(request, token.value),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.error || 'Failed to set default language' },
        { status: response.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ message: 'Request timeout' }, { status: 408 });
    }
    logger.error('Error setting default language', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
