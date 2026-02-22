import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('organizations/create');

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token');

    if (!token || !token.value) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      logger.error('API base URL is not configured');
      return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
    }

    const key = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    // Create the organization
    const createOrgResponse = await fetch(`${apiBaseUrl}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        name,
        email,
        key,
      }),
    });

    const orgData = await createOrgResponse.json().catch(() => ({}));

    if (!createOrgResponse.ok) {
      return NextResponse.json(orgData, { status: createOrgResponse.status });
    }

    const inviteResponse = await fetch(`${apiBaseUrl}/user-invitation/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        email,
        firstName: name,
        lastName: 'Admin',
        organizationId: orgData.id,
        roles: ['user'],
      }),
    });

    const inviteData = await inviteResponse.json().catch(() => ({}));

    if (!inviteResponse.ok) {
      return NextResponse.json(
        {
          ...orgData,
          warning: inviteData.message || 'Organization created but invitation failed',
        },
        { status: 201 }
      );
    }

    return NextResponse.json(orgData, { status: 201 });
  } catch (error) {
    logger.error('Error creating organization', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

