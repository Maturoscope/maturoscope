import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const organizationKey = searchParams.get('organizationKey');

    if (!organizationKey) {
      return NextResponse.json(
        { message: 'organizationKey query parameter is required' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      return NextResponse.json(
        { message: 'API base URL is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/services/contact?organizationKey=${encodeURIComponent(organizationKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error contacting services:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

