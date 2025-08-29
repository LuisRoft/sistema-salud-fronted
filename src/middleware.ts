import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/login', 
  '/_next', 
  '/favicon.ico', 
  '/api/auth', 
  '/_static',
  '/_vercel',
  '/__nextjs_original-stack-frame',
  '/__nextjs_router_state_tree'
];

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // Permitir acceso a rutas públicas
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Si es una ruta de API
    if (pathname.startsWith('/api')) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'No autorizado' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.next();
    }

    // Si no hay token y no es una ruta pública, redirigir a login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirigir a /pucem si intenta acceder a /dashboard sin ser admin
    if (pathname.startsWith('/dashboard') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/pucem', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // La autenticación se maneja en la función principal
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};