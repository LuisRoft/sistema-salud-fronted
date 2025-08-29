import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/login',
  '/_next',
  '/api/auth',
  '/favicon.ico',
  '/logo.svg',
  '/logo-pucem-white.png',
  '/_vercel',
  '/vercel.svg'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // If there's no token and we're not on a public path, redirect to login
  if (!token) {
    // Prevent redirect loop by checking if we're already going to /login
    if (!pathname.startsWith('/login')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated but trying to access login page, redirect to home
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated, check role-based access
  if (token) {
    // Redirect to /pucem if trying to access /dashboard without admin role
    if (pathname.startsWith('/dashboard') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/pucem', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|api/auth|_next/data).*)',
  ],
};