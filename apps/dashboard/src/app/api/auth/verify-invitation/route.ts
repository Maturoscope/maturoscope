import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token not provided' }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_BASE_URL}/user-invitation/verify?token=${token}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Invalid or expired token' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error verifying invitation token:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
