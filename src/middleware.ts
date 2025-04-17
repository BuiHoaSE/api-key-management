import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  try {
    // For API routes, check authentication
    if (request.nextUrl.pathname.startsWith('/api/v1/')) {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (!token?.sub) {
        console.log('[Debug] No valid token found');
        return NextResponse.json(
          { 
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required'
            }
          },
          { status: 401 }
        );
      }

      // Get the user's Supabase UUID
      const supabase = createRouteHandlerClient({ cookies });
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', token.email)
        .single();

      if (error || !user) {
        console.error('[Debug] Error fetching user:', error);
        return NextResponse.json(
          { 
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not found'
            }
          },
          { status: 401 }
        );
      }

      // Add user context to the request
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      
      console.log('[Debug] Setting user context:', {
        userId: user.id,
        headers: Object.fromEntries(requestHeaders.entries())
      });

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For dashboard routes, let NextAuth handle the redirect
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (!token?.sub) {
        const signInUrl = new URL('/api/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Debug] Middleware error:', error);
    
    // If this is an API route, return 500
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
          }
        },
        { status: 500 }
      );
    }

    // For other routes, redirect to error page
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    // Apply to all v1 API routes
    '/api/v1/:path*',
    // Apply to auth-required pages
    '/dashboard/:path*',
    // Add auth callback route for session handling
    '/api/auth/session',
  ],
}; 