
import { verifyToken } from '@/app/utils/authDecode';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get('token');

  if (!token || !token.value) {
    return NextResponse.json({ error: 'Unauthorized', message: 'No token found' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token.value);

    let termsAccepted = false;
    
    if (process.env.API_BASE_URL && decoded.userEmail) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const userData = await fetch(`${process.env.API_BASE_URL}/gateway-users/${decoded.userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (userData.ok) {
          const userDataJson = await userData.json();
          termsAccepted = userDataJson.termsAccepted || false;
          console.log('External API data fetched successfully');
        } else {
          console.warn('External API returned non-OK status:', userData.status);
        }
      } catch (apiError) {
        console.warn('Failed to fetch from external API, using token data only:', apiError);
      }
    } else {
      console.warn('API_BASE_URL not configured or userEmail missing');
    }

    return NextResponse.json({
      userId: decoded.sub,
      email: decoded.userEmail,
      name: decoded.userName,
      picture: decoded.userPicture,
      roles: decoded.userRoles || [],
      termsAccepted: termsAccepted,
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    
    if (error instanceof Error && error.message.includes('Token verification failed')) {
      console.log('Token is invalid, clearing cookies');
      const response = NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      }, { status: 401 });
      
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
    } else {
      console.error('Server error (not clearing cookies):', error);
      return NextResponse.json({ 
        error: 'Internal Server Error', 
        message: 'Unable to process request' 
      }, { status: 500 });
    }
  }
}
