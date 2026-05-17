import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect Admin Dashboard Routes
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'ADMIN') {
        // Hard boot non-admin users attempting to exploit roles
        return NextResponse.redirect(new URL('/?error=forbidden', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect Checkout Paths
  if (path.startsWith('/checkout') || path.startsWith('/orders')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/orders/:path*'],
};
