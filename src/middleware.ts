import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/_next', '/favicon.ico', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api')) {
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.next();
  }

  // Handle authentication
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle role-based redirection
  if (pathname.startsWith('/dashboard') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/pucem', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
