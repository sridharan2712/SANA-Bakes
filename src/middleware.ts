import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Skip static files, api routes, next internal routes
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  let userRole: string | null = null;
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userRole = payload.role as string;
      isAuthenticated = true;
    } catch (err) {
      // Token is invalid or expired
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 1. If user is logged in as ADMIN, and visits a customer page (not starting with /admin)
  if (isAuthenticated && userRole === 'ADMIN' && !path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 2. Protect Admin Dashboard Routes: only allow ADMIN role
  if (path.startsWith('/admin')) {
    if (!isAuthenticated || userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Protect Checkout and Orders Paths: only allow logged-in users
  if (path.startsWith('/checkout') || path.startsWith('/orders')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Redirect logged-in users away from /login or /register
  if (isAuthenticated && (path === '/login' || path === '/register')) {
    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpg, etc. (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
