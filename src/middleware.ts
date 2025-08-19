// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Si intenta acceder a /dashboard sin ser admin, enviarlo a /pucem en lugar de /unauthorized
    if (pathname.startsWith('/dashboard') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/pucem', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/pucem', '/pucem/:path*'],
};
