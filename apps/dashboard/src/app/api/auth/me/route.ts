import { verifyToken } from '@/app/utils/authDecode';
import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('auth/me');

export async function GET(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get('token');

  if (!token || !token.value) {
    return NextResponse.json({ error: 'Unauthorized', message: 'No token found' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token.value);

    let userApiData = null;
    
    if (process.env.NEXT_PUBLIC_API_BASE_URL && decoded.userEmail) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/email/${encodeURIComponent(decoded.userEmail)}`;
  
        const userData = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.value}`,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (userData.ok) {
          userApiData = await userData.json();
        } else {
          const errorText = await userData.text();
          logger.error('User API returned non-OK status', new Error(errorText || String(userData.status)), {
            status: userData.status,
          });
          return NextResponse.json({
            userId: decoded.sub,
            email: decoded.userEmail,
            name: decoded.userName || decoded.userEmail.split('@')[0],
            picture: decoded.userPicture || '/logo.png',
            roles: decoded.userRoles || [],
            firstName: decoded.userName?.split(' ')[0] || decoded.userEmail.split('@')[0],
            lastName: decoded.userName?.split(' ')[1] || '',
            organization: null,
            termsAccepted: false,
          });
        }
      } catch (apiError) {
        logger.error('Failed to fetch from user API', apiError);
        return NextResponse.json({
          userId: decoded.sub,
          email: decoded.userEmail,
          name: decoded.userName || decoded.userEmail.split('@')[0],
          picture: decoded.userPicture || '/logo.png',
          roles: decoded.userRoles || [],
          firstName: decoded.userName?.split(' ')[0] || decoded.userEmail.split('@')[0],
          lastName: decoded.userName?.split(' ')[1] || '',
          organization: null,
          termsAccepted: false,
        });
      }
    } else {
      logger.warn('API base URL not configured or userEmail missing');
      return NextResponse.json({
        userId: decoded.sub,
        email: decoded.userEmail,
        name: decoded.userName || decoded.userEmail.split('@')[0],
        picture: decoded.userPicture || '/logo.png',
        roles: decoded.userRoles || [],
        firstName: decoded.userName?.split(' ')[0] || decoded.userEmail.split('@')[0],
        lastName: decoded.userName?.split(' ')[1] || '',
        organization: null,
        termsAccepted: false,
      });
    }

    return NextResponse.json({
      userId: decoded.sub,
      email: decoded.userEmail,
      name: userApiData ? `${userApiData.firstName} ${userApiData.lastName}` : decoded.userName,
      picture: userApiData?.organization?.avatar || decoded.userPicture,
      roles: decoded.userRoles || [],
      firstName: userApiData?.firstName,
      lastName: userApiData?.lastName,
      organization: userApiData?.organization,
      registrationStatus: userApiData?.registrationStatus,
      isActive: userApiData?.isActive,
      termsAccepted: userApiData?.termsAccepted || false,
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('Token verification failed')) {
      logger.warn('Token invalid or expired, clearing cookies');
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
      logger.error('Error verifying token', error);
      return NextResponse.json({ 
        error: 'Internal Server Error', 
        message: 'Unable to process request' 
      }, { status: 500 });
    }
  }
}
