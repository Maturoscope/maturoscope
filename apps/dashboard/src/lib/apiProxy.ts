import { NextRequest } from 'next/server';

/** Cookie holding the user's currently-active organization id. */
export const ACTIVE_ORG_COOKIE = 'active-organization-id';

/**
 * Builds the headers used when proxying an authenticated request to the NestJS
 * API: the bearer token plus, when present, the active-organization header so
 * org-scoped endpoints operate on the organization the user has selected.
 */
export function buildApiHeaders(
  request: NextRequest,
  token: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const activeOrganizationId = request.cookies.get(ACTIVE_ORG_COOKIE)?.value;
  if (activeOrganizationId) {
    headers['X-Active-Organization'] = activeOrganizationId;
  }

  return headers;
}
