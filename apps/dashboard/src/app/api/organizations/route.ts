import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Fetch organizations with registration status already calculated by the backend
    // The backend uses the same logic as members with INVITATION_TOKEN_EXPIRATION from config
    const orgResponse = await fetch(`${apiBaseUrl}/organizations?withStatus=true`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await orgResponse.json().catch(() => ({}));

    if (!orgResponse.ok) {
      return NextResponse.json(
        { message: data.message || data.error || 'Failed to fetch organizations' },
        { status: orgResponse.status },
      );
    }

    // Return the organizations with registrationStatus already calculated by the backend
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ message: 'Request timeout' }, { status: 408 });
    }

    console.error('Error fetching organizations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

