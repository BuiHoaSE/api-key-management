import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ApiException, createApiResponse, handleApiError } from '@/utils/api-response'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      throw new ApiException(
        'UNAUTHORIZED',
        'User not authenticated',
        401
      )
    }

    const { key } = await request.json()
    if (!key) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'API key is required',
        400
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type, expires_at')
      .eq('key', key)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('[Debug] Error validating API key:', error)
      throw new ApiException(
        'DATABASE_ERROR',
        'Failed to validate API key',
        500,
        error.message
      )
    }

    if (!data) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'INVALID_KEY',
          message: 'Invalid API key'
        })
      )
    }

    // Check if key is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'EXPIRED_KEY',
          message: 'API key has expired'
        })
      )
    }

    return NextResponse.json(
      createApiResponse({
        valid: true,
        key: {
          id: data.id,
          name: data.name,
          type: data.type
        }
      })
    )
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(
      errorResponse,
      { status: error instanceof ApiException ? error.status : 500 }
    )
  }
} 