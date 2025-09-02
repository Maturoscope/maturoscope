import { ROLES_MAPPED } from '@/app/utils/getUserRoles';
import { NextResponse } from 'next/server';
import { decryptPassword } from '@/app/utils/crypto';

export const POST = async (req: Request) => {
  try {
    const { email, password, firstName, lastName, roles } = await req.json();

    // Read Auth0 configuration directly from environment variables
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const issuerUrl = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    const decryptedPassword = await decryptPassword(password, email);

    const authResponse = await fetch(`${issuerUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: `${issuerUrl}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      return NextResponse.json(
        { error: authData.error_description || 'Error getting token from Auth0' },
        { status: 400 },
      );
    }

    const managementToken = authData.access_token;

    const userResponse = await fetch(`${issuerUrl}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managementToken}`,
      },
      body: JSON.stringify({
        email,
        password: decryptedPassword,
        name: `${firstName} ${lastName}`,
        connection: 'Username-Password-Authentication',
      }),
    });

    const userData = await userResponse.json();
    const userId = userData.user_id;
    if (!userResponse.ok) {
      return NextResponse.json({ error: userData.message || 'Error creating user' }, { status: 400 });
    }
    const rolesToAssign = roles?.map((role: keyof typeof ROLES_MAPPED) => ROLES_MAPPED[role]);

    const assignRolesResponse = await fetch(`${issuerUrl}/api/v2/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managementToken}`,
      },
      body: JSON.stringify({
        roles: rolesToAssign,
      }),
    });

    if (!assignRolesResponse.ok) {
      const errorData = await assignRolesResponse.json();
      console.error(`Error al asignar roles: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error: ' + error }, { status: 500 });
  }
};
