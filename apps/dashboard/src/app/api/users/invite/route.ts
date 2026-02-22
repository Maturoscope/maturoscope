import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('users/invite');

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token');

    if (!token || !token.value) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      logger.error('API base URL is not configured');
      return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
    }

    const response = await fetch(`${apiBaseUrl}/user-invitation/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      logger.error('Invitation request failed', new Error((data as { message?: string }).message ?? 'Invite failed'), {
        status: response.status,
      });
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error sending invitation', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

