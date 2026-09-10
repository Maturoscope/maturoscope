import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';
import { buildApiHeaders } from '@/lib/apiProxy';

const logger = createStructuredLogger('organizations/memberships');

/**
 * GET /api/organizations/memberships
 * The current user's organizations (active + pending invitations).
 */
export async function GET(request: NextRequest) {
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
    const response = await fetch(`${apiBaseUrl}/users/me/organizations`, {
      headers: buildApiHeaders(request, token.value),
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Error fetching memberships', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/organizations/memberships
 * Sets the default organization: { organizationId }.
 */
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${apiBaseUrl}/users/me/organizations/default`, {
      method: 'PATCH',
      headers: buildApiHeaders(request, token.value),
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Error setting default organization', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
