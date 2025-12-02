import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if user has a session token (cookie-based)
  const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                       request.cookies.get('__Secure-authjs.session-token')?.value;

  // Define protected routes
  const protectedRoutes = ['/mode-selection', '/solo-onboarding', '/family-setup'];
  const authRoutes = ['/auth/login', '/auth/plan-selection', '/auth/verify-email', '/auth/error'];

  // If accessing auth routes with session, redirect to home
  if (authRoutes.some(route => pathname.startsWith(route)) && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing protected routes without session, redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !sessionToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
