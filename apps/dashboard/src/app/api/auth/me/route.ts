
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

    let userApiData = null;
    
    if (process.env.API_BASE_URL && decoded.userEmail) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const apiUrl = `${process.env.API_BASE_URL}/users/${decoded.userEmail}`;
  
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
          console.error('User API returned non-OK status:', userData.status, errorText);
          
          // Fallback: usar datos del token si la API falla
          console.log('Falling back to token data');
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
        console.error('Failed to fetch from user API:', apiError);
        
        // Fallback: usar datos del token si la API falla
        console.log('Falling back to token data due to API error');
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
      console.warn('API_BASE_URL not configured or userEmail missing');
      console.log('Using token data only');
      
      // Usar datos del token cuando no hay configuración de API
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
      termsAccepted: userApiData?.termsAccepted || false,
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
