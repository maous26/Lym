import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==========================================
// MIDDLEWARE - Protection des routes (optimisé)
// ==========================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Vérification rapide via cookie (sans appel réseau)
  // NextAuth stocke le token dans ces cookies
  const sessionToken = 
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  const isAuthenticated = !!sessionToken;

  // Routes protégées (nécessitent une authentification)
  const protectedRoutes = [
    '/mode-selection',
    '/onboarding',
    '/meals',
    '/recipes',
    '/coach',
    '/profile',
    '/progress',
    '/weight',
    '/community',
    '/family',
    '/search',
  ];

  // Routes d'authentification (accessibles uniquement si non connecté)
  const authRoutes = ['/auth/login', '/auth/error'];

  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirection si accès à une route auth alors qu'on est déjà connecté
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/plan-selection', request.url));
  }

  // Redirection si accès à une route protégée sans être connecté
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Page d'accueil : rediriger vers login si non authentifié
  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*|_next).*)',
  ],
};
