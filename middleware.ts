import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

export function middleware(request: NextRequest) {
  // Enable CORS for all routes
  const response = NextResponse.next();
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  // Check authentication for API routes (except auth and health)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow unauthenticated access to auth and health endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth') || 
        request.nextUrl.pathname === '/api/health') {
      return response;
    }

    // Verify JWT token for protected routes
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: response.headers }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: response.headers }
      );
    }

    // Add user info to request headers for downstream use
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-tenant-id', payload.tenantId);
    response.headers.set('x-user-role', payload.role);
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
