import { NextResponse } from 'next/server';
import forge from 'node-forge';

const privateKeyPem = process.env.NEXT_PUBLIC_PRIVATE_KEY;

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    // Verificar que las variables de entorno estén configuradas
    if (!privateKeyPem) {
      console.error('NEXT_PUBLIC_PRIVATE_KEY no está configurada')
      return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
    }

    if (!process.env.AUTH0_ISSUER_BASE_URL) {
      console.error('AUTH0_ISSUER_BASE_URL no está configurada')
      return NextResponse.json({ error: 'Configuración de Auth0 incompleta' }, { status: 500 });
    }

    if (!process.env.AUTH0_CLIENT_ID) {
      console.error('AUTH0_CLIENT_ID no está configurada')
      return NextResponse.json({ error: 'Configuración de Auth0 incompleta' }, { status: 500 });
    }

    if (!process.env.AUTH0_CLIENT_SECRET) {
      console.error('AUTH0_CLIENT_SECRET no está configurada')
      return NextResponse.json({ error: 'Configuración de Auth0 incompleta' }, { status: 500 });
    }

    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const decryptedPassword = privateKey.decrypt(forge.util.decode64(password));

    const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        username: email,
        password: decryptedPassword,
        audience: process.env.AUTH0_AUDIENCE,
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
