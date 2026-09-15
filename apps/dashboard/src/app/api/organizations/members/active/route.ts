import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';
import { buildApiHeaders } from '@/lib/apiProxy';

const logger = createStructuredLogger('organizations/members/active');

/**
 * PATCH /api/organizations/members/active
 * Enable/disable a member's access to an organization: { userId, organizationId, isActive }.
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
    const { userId, organizationId, isActive } = await request.json();
    if (!userId || !organizationId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { message: 'userId, organizationId and isActive are required' },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/users/organization/${organizationId}/members/${userId}/active`,
      {
        method: 'PATCH',
        headers: buildApiHeaders(request, token.value),
        body: JSON.stringify({ isActive }),
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Error updating membership active flag', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
