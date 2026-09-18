import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';
import { ACTIVE_ORG_COOKIE } from '@/lib/apiProxy';

const logger = createStructuredLogger('organizations/active');

/**
 * POST /api/organizations/active
 * Switches the session's active organization by updating the cookie. The NestJS
 * API validates the id against the user's active memberships on every request
 * (falling back to the default), so this only needs to persist the choice.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { organizationId } = await request.json();
    if (!organizationId || typeof organizationId !== 'string') {
      return NextResponse.json({ message: 'organizationId is required' }, { status: 400 });
    }

    const response = NextResponse.json({ message: 'Active organization updated' });
    response.cookies.set(ACTIVE_ORG_COOKIE, organizationId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return response;
  } catch (error) {
    logger.error('Error updating active organization', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
