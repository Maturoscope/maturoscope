import { NextResponse } from 'next/server';
import forge from 'node-forge';

const privateKeyPem = process.env.NEXT_PUBLIC_PRIVATE_KEY;

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    // Forzar lectura de variables en runtime para Kubernetes (usando bracket notation)
    const clientSecret = process.env['AUTH0_CLIENT_SECRET'] || process.env['NEXT_PUBLIC_AUTH0_CLIENT_SECRET'];
    const issuerUrl = process.env['NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL'];
    const clientId = process.env['NEXT_PUBLIC_AUTH0_CLIENT_ID'];
    const audience = process.env['NEXT_PUBLIC_AUTH0_AUDIENCE'];

    // DEBUG: Ver qué variables están disponibles en Kubernetes
    console.log('=== DEBUG KUBERNETES ENV ===');
    console.log('clientSecret exists:', !!clientSecret);
    console.log('clientSecret length:', clientSecret?.length || 0);
    console.log('issuerUrl:', issuerUrl);
    console.log('clientId:', clientId);
    console.log('audience:', audience);
    console.log('============================');

    // Verificar que las variables de entorno estén configuradas
    if (!privateKeyPem) {
      console.error('NEXT_PUBLIC_PRIVATE_KEY no está configurada')
      return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
    }

    if (!issuerUrl) {
      console.error('NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL no está configurada')
      return NextResponse.json({ error: 'Configuración de Auth0 incompleta' }, { status: 500 });
    }

    if (!clientId) {
      console.error('NEXT_PUBLIC_AUTH0_CLIENT_ID no está configurada')
      return NextResponse.json({ error: 'Configuración de Auth0 incompleta' }, { status: 500 });
    }

    if (!clientSecret) {
      console.error('AUTH0_CLIENT_SECRET no está configurada (intentó leer AUTH0_CLIENT_SECRET y NEXT_PUBLIC_AUTH0_CLIENT_SECRET)')
      return NextResponse.json({ error: 'Configuración de Auth0 incompleta' }, { status: 500 });
    }

    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const decryptedPassword = privateKey.decrypt(forge.util.decode64(password));

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

    const responseHeaders = new Headers();
    responseHeaders.append('Set-Cookie', `token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

    return new NextResponse(JSON.stringify({ message: 'Login successfully' }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error: ' + error }, { status: 500 });
  }
};
