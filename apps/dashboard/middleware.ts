import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === '/login';
  const isRoot = pathname === '/';
  const isProtectedRoute = pathname.startsWith('/dashboard');

  if (!token && (isProtectedRoute || isRoot)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && (isAuthPage || isRoot)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
