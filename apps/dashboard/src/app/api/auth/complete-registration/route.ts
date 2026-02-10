import { NextRequest, NextResponse } from 'next/server';
import { decryptPassword } from '@/app/utils/crypto';
import { ROLES_MAPPED } from '@/app/utils/getUserRoles';

interface InvitationResponse {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
}

const AUTH0_CONNECTION = process.env.AUTH0_CONNECTION || 'Username-Password-Authentication';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const issuerUrl = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

    if (!apiBaseUrl || !issuerUrl || !clientId || !clientSecret || !audience) {
      return NextResponse.json({ message: 'Auth0 configuration is incomplete' }, { status: 500 });
    }

    const verifyResponse = await fetch(`${apiBaseUrl}/user-invitation/verify?token=${encodeURIComponent(token)}`);
    const invitationData = (await verifyResponse.json()) as InvitationResponse;

    if (!verifyResponse.ok) {
      return NextResponse.json(invitationData, { status: verifyResponse.status });
    }

    const { email, firstName, lastName, roles } = invitationData;
    const decryptedPassword = await decryptPassword(password, email);

    if (!decryptedPassword) {
      return NextResponse.json({ message: 'Invalid password payload' }, { status: 400 });
    }

    const managementTokenResponse = await fetch(`${issuerUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: `${issuerUrl}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    const managementTokenData = await managementTokenResponse.json();

    if (!managementTokenResponse.ok) {
      const message = managementTokenData.error_description || managementTokenData.message || 'Error obtaining Auth0 management token';
      return NextResponse.json({ message }, { status: managementTokenResponse.status || 400 });
    }

    const managementToken: string | undefined = managementTokenData.access_token;

    if (!managementToken) {
      return NextResponse.json({ message: 'Auth0 management token not available' }, { status: 500 });
    }

    const createUserResponse = await fetch(`${issuerUrl}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managementToken}`,
      },
      body: JSON.stringify({
        email,
        password: decryptedPassword,
        name: `${firstName} ${lastName}`.trim(),
        connection: AUTH0_CONNECTION,
        verify_email: true,
      }),
    });

    const createdUserData = await createUserResponse.json();

    if (!createUserResponse.ok) {
      const message = createdUserData.message || createdUserData.error_description || 'Error creating Auth0 user';
      return NextResponse.json({ message }, { status: createUserResponse.status || 400 });
    }

    const auth0UserId: string | undefined = createdUserData.user_id;

    if (!auth0UserId) {
      return NextResponse.json({ message: 'Auth0 user ID not returned' }, { status: 500 });
    }

    const mappedRoles = Array.isArray(roles)
      ? roles
          .map((role) => (role in ROLES_MAPPED ? ROLES_MAPPED[role as keyof typeof ROLES_MAPPED] : undefined))
          .filter((value): value is string => Boolean(value))
      : [];

    if (mappedRoles.length > 0) {
      const assignRolesResponse = await fetch(`${issuerUrl}/api/v2/users/${encodeURIComponent(auth0UserId)}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managementToken}`,
        },
        body: JSON.stringify({ roles: mappedRoles }),
      });

      if (!assignRolesResponse.ok) {
        const errorData = await assignRolesResponse.json().catch(() => ({}));
        console.error('Error assigning roles in Auth0:', errorData);
      }
    }

    const completeResponse = await fetch(`${apiBaseUrl}/user-invitation/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, authId: auth0UserId }),
    });

    const completeData = await completeResponse.json().catch(() => ({}));

    if (!completeResponse.ok) {
      return NextResponse.json(completeData, { status: completeResponse.status });
    }

    const loginResponse = await fetch(`${issuerUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: email,
        password: decryptedPassword,
        audience,
        scope: 'openid profile email',
        connection: AUTH0_CONNECTION,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      const message = loginData.error_description || loginData.message || 'Error logging in after registration';
      return NextResponse.json({ message }, { status: loginResponse.status || 400 });
    }

    const response = NextResponse.json({ message: 'Registration completed successfully' }, { status: 200 });

    if (loginData.access_token) {
      response.cookies.set({
        name: 'token',
        value: loginData.access_token,
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
        maxAge: typeof loginData.expires_in === 'number' ? loginData.expires_in : 60 * 60 * 24,
      });
    }

    return response;
  } catch (error) {
    console.error('Error completing registration:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

