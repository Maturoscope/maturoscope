import { NextRequest, NextResponse } from 'next/server';
import { createStructuredLogger } from '@/lib/structured-logger';

const logger = createStructuredLogger('users/avatar');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

/**
 * PATCH /api/users/avatar
 * Uploads the current user's profile picture (multipart, field "file").
 */
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPG, PNG and SVG are allowed.' },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'File size exceeds 4MB limit.' }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${apiBaseUrl}/users/me/avatar`, {
      method: 'PATCH',
      // Don't set Content-Type: let fetch set the multipart boundary.
      headers: { Authorization: `Bearer ${token.value}` },
      body: backendFormData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ message: 'Request timeout' }, { status: 408 });
    }
    logger.error('Error uploading user avatar', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/avatar
 * Removes the current user's profile picture.
 */
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !token.value) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}/users/me/avatar`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Error removing user avatar', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
