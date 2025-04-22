import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// JWT secret (should match the one in auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  // Add other protected paths as needed
];

// Paths that should redirect to dashboard if already authenticated
const publicOnlyPaths = [
  '/login',
  '/register',
  // Add other public-only paths as needed
];

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Get auth token from cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if path is protected but user is not authenticated
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  const isPublicOnlyRoute = publicOnlyPaths.some(path => pathname.startsWith(path));
  
  try {
    if (token) {
      // Verify the token
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      
      // If token is valid and trying to access public-only route, redirect to dashboard
      if (isPublicOnlyRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // User is authenticated and accessing a regular or protected route, allow
      return NextResponse.next();
    } else {
      // No token and trying to access protected route, redirect to login
      if (isProtectedRoute) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(pathname));
        return NextResponse.redirect(url);
      }
      
      // No token and accessing public route, allow
      return NextResponse.next();
    }
  } catch (error) {
    // Token verification failed
    if (isProtectedRoute) {
      // Clear the invalid token from cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
    
    return NextResponse.next();
  }
} 