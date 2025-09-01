
import { verifyToken } from '@/app/utils/authDecode';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookies = req.cookies;
    const token = cookies.get('token');

    if (!token || !token.value) {
      return NextResponse.json({ error: 'Unauthorized', message: 'No token found' }, { status: 401 });
    }

    const decoded = (await verifyToken(token.value)) as JwtPayload;

    const userData = await fetch(`${process.env.API_BASE_URL}/gateway-users/${decoded.userEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userData.ok) {
      return NextResponse.json({ error: 'Unauthorized', message: 'User not found' }, { status: 401 });
    }
    const userDataJson = await userData.json();

    return NextResponse.json({
      userId: decoded.sub,
      email: decoded.userEmail,
      name: decoded.userName,
      picture: decoded.userPicture,
      roles: decoded.userRoles,
      termsAccepted: userDataJson.termsAccepted,
    });
  } catch (error) {
    console.error('Error verifying token: ', error);

    const response = NextResponse.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, { status: 401 });
    const token = req.cookies.get('token');
    const sessionToken = req.cookies.get('next-auth.session-token');

    if (token || sessionToken) {
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
    }

    return response;
  }
}
