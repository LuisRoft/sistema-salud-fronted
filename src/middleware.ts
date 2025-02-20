// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Protección para dashboard
    if (pathname.startsWith('/dashboard') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Protección general para todas las rutas protegidas
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
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
