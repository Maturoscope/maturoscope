import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('users/resend-invitation');

export async function POST(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get('token');

  if (!token || !token.value) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No token found' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { email, firstName, lastName, organizationId } = body;

    if (!email || !firstName || !lastName || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    const response = await fetch(`${apiBaseUrl}/user-invitation/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        organizationId,
        roles: ['user'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to resend invitation' }));
      return NextResponse.json(
        { message: errorData.message || 'Failed to resend invitation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error resending invitation', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

