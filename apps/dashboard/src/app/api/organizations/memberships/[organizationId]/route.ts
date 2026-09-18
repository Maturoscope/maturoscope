import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';
import { buildApiHeaders } from '@/lib/apiProxy';

const logger = createStructuredLogger('organizations/memberships/action');

const ACTION_PATHS: Record<string, string> = {
  accept: 'accept',
  decline: 'decline',
  leave: 'leave',
};

/**
 * POST /api/organizations/memberships/:organizationId
 * Membership actions on a pending/active organization: { action: accept|decline|leave }.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const { organizationId } = await params;
    const { action } = await request.json();
    const actionPath = ACTION_PATHS[action];
    if (!actionPath) {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch(
      `${apiBaseUrl}/users/me/organizations/${organizationId}/${actionPath}`,
      {
        method: 'POST',
        headers: buildApiHeaders(request, token.value),
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Error performing membership action', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
