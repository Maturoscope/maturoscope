import { NextResponse } from 'next/server';
import { decryptPassword } from '@/app/utils/crypto';

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
      if (data.error_description && data.error_description.includes('Your account has been blocked')) {
        return NextResponse.json({ error: data.error_description || 'Error en autenticación' }, { status: 423 });
      }
      return NextResponse.json({ error: data.error_description || 'Error en autenticación' }, { status: 400 });
    }

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

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
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
      }
    } catch (error) {
      console.error('Error checking user active status:', error);
      // Continue with login if there's an error checking the status
    }

    const responseHeaders = new Headers();
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = process.env.NEXT_PUBLIC_AUTH0_BASE_URL?.startsWith('https://');
    const secureFlag = isProduction && isHttps ? 'Secure; ' : '';
    
    responseHeaders.append('Set-Cookie', `token=${data.access_token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax`);

    return new NextResponse(JSON.stringify({ message: 'Login successfully' }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error: ' + error }, { status: 500 });
  }
};
