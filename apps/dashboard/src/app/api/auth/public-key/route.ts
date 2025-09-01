import { NextResponse } from 'next/server';

export const GET = async () => {
  const publicKeyPem = process.env.NEXT_PUBLIC_PUBLIC_KEY?.replace(/\\n/g, '\n');

  if (!publicKeyPem) {
    return new NextResponse('Public key not found', { status: 500 });
  }

  return new NextResponse(publicKeyPem, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
};
