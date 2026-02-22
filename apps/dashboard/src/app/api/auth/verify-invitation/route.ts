import { type NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('auth/verify-invitation');

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token not provided' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-invitation/verify?token=${token}`);
    const data = await response.json();

    if (!response.ok) {
      logger.error('Invitation token verify failed', new Error((data as { message?: string }).message ?? 'Invalid token'), {
        status: response.status,
      });
      return NextResponse.json({ message: data.message || 'Invalid or expired token' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error verifying invitation token', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
