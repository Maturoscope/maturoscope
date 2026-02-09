import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get('token');

  if (!token || !token.value) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No token found' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { organizationId, email } = body;

    if (!organizationId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Use the email directly to get the first user (the email is the organization's email which is the first user's email)
    const userResponse = await fetch(
      `${apiBaseUrl}/users/email/${encodeURIComponent(email)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({ message: 'Failed to fetch user' }));
      return NextResponse.json(
        { message: errorData.message || errorData.error || 'Failed to fetch user' },
        { status: userResponse.status }
      );
    }

    const firstUser = await userResponse.json();

    if (!firstUser || !firstUser.email) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const response = await fetch(`${apiBaseUrl}/user-invitation/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        email: firstUser.email,
        firstName: firstUser.firstName,
        lastName: firstUser.lastName,
        organizationId,
        roles: ['user'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to resend invitation' }));
      return NextResponse.json(
        { message: errorData.message || 'Failed to resend invitation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

