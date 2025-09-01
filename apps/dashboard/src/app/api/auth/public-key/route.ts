import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const GET = async () => {
  try {
    const publicKeyPath = process.env.PUBLIC_KEY_PATH;
    
    if (!publicKeyPath) {
      return new NextResponse('Public key path not configured', { status: 500 });
    }

    const fullPath = path.resolve(process.cwd(), publicKeyPath);
    const publicKeyPem = fs.readFileSync(fullPath, 'utf8');

    return new NextResponse(publicKeyPem, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Error reading public key:', error);
    return new NextResponse('Public key not found', { status: 500 });
  }
};
