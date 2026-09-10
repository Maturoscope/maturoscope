import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';
import { buildApiHeaders } from '@/lib/apiProxy';

const logger = createStructuredLogger('users/invite-check');

/**
 * GET /api/users/invite-check?email=&organizationId=
 * Pre-check before inviting so the UI can show the right screen
 * (new / already in org / exists in another org).
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const organizationId = searchParams.get('organizationId');
    if (!email || !organizationId) {
      return NextResponse.json(
        { message: 'email and organizationId are required' },
        { status: 400 },
      );
    }

    const url = `${apiBaseUrl}/user-invitation/check?email=${encodeURIComponent(
      email,
    )}&organizationId=${encodeURIComponent(organizationId)}`;
    const response = await fetch(url, { headers: buildApiHeaders(request, token.value) });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Error checking invitation', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
