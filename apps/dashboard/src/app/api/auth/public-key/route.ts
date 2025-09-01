import { NextResponse } from 'next/server';

export const GET = async () => {
  // Temporary debug logs to diagnose the issue
  console.log('=== PUBLIC KEY DEBUG ===');
  console.log('PUBLIC_KEY exists:', !!process.env.PUBLIC_KEY);
  console.log('PUBLIC_KEY length:', process.env.PUBLIC_KEY?.length || 0);
  console.log('PUBLIC_KEY first 50 chars:', process.env.PUBLIC_KEY?.substring(0, 50) || 'undefined');
  console.log('All env vars starting with PUB:', Object.keys(process.env).filter(k => k.includes('PUB')));
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('========================');
  
  const publicKeyPem = process.env.PUBLIC_KEY?.replace(/\\n/g, '\n');

  if (!publicKeyPem) {
    console.error('PUBLIC_KEY is missing or empty');
    return new NextResponse('Public key not found', { status: 500 });
  }

  return new NextResponse(publicKeyPem, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
};
