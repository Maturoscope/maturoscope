import { NextResponse } from 'next/server';

const clearTokens = () => {
  const response = NextResponse.json({ message: 'Successful logout' });

  const cookiesToClear = ['token', 'next-auth.session-token'];
  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, '', {
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  });

  return response;
};

export async function GET() {
  return clearTokens();
}

export async function POST() {
  return clearTokens();
}
