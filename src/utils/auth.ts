import { createServerClient } from './supabase/server'
import { NextResponse } from 'next/server'
import { ApiException } from './api-response'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAuth() {
  try {
    // Primary authentication through NextAuth
    const nextAuthSession = await getServerSession(authOptions)
    if (!nextAuthSession?.user) {
      throw new ApiException('UNAUTHORIZED', 'Authentication required', 401)
    }

    // Optional Supabase session check
    const supabase = createServerClient()
    const { data: { session: supabaseSession }, error: supabaseError } = await supabase.auth.getSession()

    // Return user data with Supabase session if available
    return {
      ...nextAuthSession.user,
      supabaseId: supabaseSession?.user?.id || null,
      // Include full session data if needed
      supabaseSession: supabaseSession || null
    }
  } catch (error) {
    console.error('Auth error:', error)
    if (error instanceof ApiException) {
      throw error
    }
    throw new ApiException('INTERNAL_ERROR', 'Authentication failed', 500)
  }
} 