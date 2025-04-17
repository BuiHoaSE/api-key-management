import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { ApiException, createApiResponse, handleApiError } from '@/utils/api-response'
import { CreateApiKeyDto } from '@/types/api-key'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      throw new ApiException(
        'UNAUTHORIZED',
        'User not authenticated',
        401
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'Invalid user ID format',
        400
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    
    const supabase = createRouteHandlerClient({ cookies })
    let query = supabase
      .from('api_keys')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error, count } = await query

    if (error) {
      throw new ApiException(
        'DATABASE_ERROR',
        'Failed to fetch API keys',
        500,
        error.message
      )
    }

    return NextResponse.json(
      createApiResponse(data, undefined, {
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limit) : 0
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

    const body = await request.json() as CreateApiKeyDto
    if (!body.name || !body.type) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'Name and type are required fields',
        400
      )
    }

    const newKey = {
      id: randomUUID(),
      name: body.name,
      key: `ak_${nanoid(32)}`,
      type: body.type,
      usage: 0,
      rate_limit: 200,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: body.description || null,
      expires_at: body.expiresIn ? new Date(Date.now() + body.expiresIn).toISOString() : null
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from('api_keys')
      .insert(newKey)
      .select()
      .single()

    if (error) {
      console.error('[Debug] Failed to create API key:', error);
      throw new ApiException(
        'DATABASE_ERROR',
        'Failed to create API key',
        500,
        error.message
      )
    }

    return NextResponse.json(createApiResponse(data))
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(
      errorResponse,
      { status: error instanceof ApiException ? error.status : 500 }
    )
  }
} 