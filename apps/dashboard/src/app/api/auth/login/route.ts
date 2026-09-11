import { NextResponse } from 'next/server';
import { decryptPassword } from '@/app/utils/crypto';
import { createStructuredLogger } from '@/lib/structured-logger';
import { ACTIVE_ORG_COOKIE } from '@/lib/apiProxy';

const logger = createStructuredLogger('auth/login');

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const issuerUrl = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

    const decryptedPassword = await decryptPassword(password, email);

    const response = await fetch(`${issuerUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: email,
        password: decryptedPassword,
        audience: audience,
        scope: 'openid profile email',
        connection: 'Username-Password-Authentication',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const blocked = data.error_description?.includes('Your account has been blocked');
      logger.error('Login failed', new Error(data.error_description ?? 'Auth error'), {
        status: response.status,
        code: blocked ? 'ACCOUNT_BLOCKED' : 'AUTH_FAILED',
      });
      if (blocked) {
        return NextResponse.json({ error: data.error_description || 'Error en autenticación' }, { status: 423 });
      }
      return NextResponse.json({ error: data.error_description || 'Error en autenticación' }, { status: 400 });
    }

    // The organization the session starts on. Login always lands on the user's
    // default organization; switching happens later from the profile.
    let activeOrganizationId: string | undefined;

    // Whether the authenticated identity is provisioned in our database. A user
    // can exist in Auth0 but not here; in that case we must not grant access.
    // We only treat a definitive "not found" as a block — transient API errors
    // stay tolerant so an outage doesn't lock everyone out.
    let userFound = true;

    // Check if the user is active in our database and if the organization is active
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const userResponse = await fetch(`${apiBaseUrl}/users/email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      const userData = userResponse.ok ? await userResponse.json().catch(() => null) : null;

      if (userResponse.ok && userData && userData.id) {

        // Default organization for the session (backfill keeps organizationId in
        // sync with the default membership).
        activeOrganizationId = userData.defaultOrganizationId || userData.organizationId || undefined;

        // Check if the user is inactive
        if (userData.isActive === false) {
          return NextResponse.json(
            { 
              error: 'Your account is inactive. Please contact your administrator.',
              code: 'INACTIVE_ACCOUNT'
            }, 
            { status: 403 }
          );
        }

        // Check if the organization is inactive
        if (userData.organizationId) {
          const orgResponse = await fetch(`${apiBaseUrl}/organizations/${userData.organizationId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            
            // Check if the organization is inactive
            // The organization entity uses 'status' field with values 'active' or 'inactive'
            if (orgData.status === 'inactive' || orgData.isActive === false) {
              return NextResponse.json(
                { 
                  error: 'Your organization is currently inactive. Please contact your administrator to reactivate your organization.',
                  code: 'INACTIVE_ORGANIZATION'
                }, 
                { status: 403 }
              );
            }
          }
        }
      } else if (userResponse.ok || userResponse.status === 404) {
        // Reachable API with a definitive "not found": the identity exists in
        // Auth0 but not in our database, so access must be denied.
        userFound = false;
      }
    } catch (error) {
      logger.error('Error checking user active status', error);
    }

    if (!userFound) {
      return NextResponse.json(
        {
          error: 'Your account is not set up in Maturoscope. Please contact your administrator.',
          code: 'ACCOUNT_NOT_FOUND',
        },
        { status: 403 },
      );
    }

    logger.info('Login success');

    const responseHeaders = new Headers();
    responseHeaders.append('Set-Cookie', `token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    // Start the session on the default organization.
    if (activeOrganizationId) {
      responseHeaders.append(
        'Set-Cookie',
        `${ACTIVE_ORG_COOKIE}=${activeOrganizationId}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      );
    }

    return new NextResponse(JSON.stringify({ message: 'Login successfully' }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('Login request failed', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error }, { status: 500 });
  }
};
