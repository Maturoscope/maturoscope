import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const { email } = await req.json();

    const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/dbconnections/change_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        connection: 'Username-Password-Authentication',
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: responseText || 'Error sending reset password email' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset email sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error: ' + error }, { status: 500 });
  }
};
