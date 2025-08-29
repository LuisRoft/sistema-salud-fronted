import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = [
  '/login',
  '/_next',
  '/api/auth',
  '/favicon.ico',
  '/logo.svg',
  '/_vercel',
  '/vercel.svg',
  '/logo-pucem-white.png'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths and static files
  if (
    publicPaths.some(path => 
      pathname === path || 
      pathname.startsWith(`${path}/`) ||
      pathname.endsWith(path.split('/').pop() || '')
    ) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    /\.[a-z0-9]+$/i.test(pathname) // Skip all file extensions
  ) {
    return NextResponse.next();
  }

  // Get token with error handling
  let token;
  try {
    token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    console.error('Error getting token:', error);
    // If token retrieval fails, treat as unauthenticated
    token = null;
  }

  // Handle unauthenticated users
  if (!token) {
    if (pathname === '/login') {
      return NextResponse.next();
    }
    
    // Prevent redirect loops by checking if we're already being redirected
    const isRedirect = request.headers.get('x-middleware-redirect');
    if (isRedirect) {
      return NextResponse.next();
    }
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname || '/');
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('x-middleware-redirect', 'true');
    return response;
  }

  // Handle authenticated users
  if (pathname === '/login') {
    const dashboardUrl = token.role === 'admin' ? '/dashboard' : '/pucem';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Handle root path for authenticated users
  if (pathname === '/') {
    const dashboardUrl = token.role === 'admin' ? '/dashboard' : '/pucem';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based access control
  if (pathname.startsWith('/dashboard') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/pucem', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|api/|_vercel|favicon.ico|logo|vercel.svg).*)',
  ],
};