import { NextResponse } from 'next/server';
import { ACTIVE_ORG_COOKIE } from '@/lib/apiProxy';

const clearTokens = () => {
  const response = NextResponse.json({ message: 'Successful logout' });

  const cookiesToClear = ['token', 'next-auth.session-token', ACTIVE_ORG_COOKIE];
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
