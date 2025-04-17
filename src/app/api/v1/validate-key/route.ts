import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ApiException, createApiResponse, handleApiError } from '@/utils/api-response'

interface ValidateKeyResult {
  valid: boolean
  id: string | null
  name: string | null
  type: string | null
  usage: number | null
  rate_limit: number | null
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

    const { key } = await request.json()
    if (!key) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'API key is required',
        400
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Use the validate_and_increment_key function
    const { data, error: keyError } = await supabase
      .rpc('validate_and_increment_key', {
        p_api_key: key,
        p_user_id: userId
      })
      .returns<ValidateKeyResult>()
      .single()

    if (keyError) {
      console.error('[Debug] Error validating API key:', keyError)
      throw new ApiException(
        'DATABASE_ERROR',
        'Failed to validate API key',
        500,
        keyError.message
      )
    }

    const keyData = data as ValidateKeyResult
    if (!keyData?.valid) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'INVALID_KEY',
          message: 'Invalid API key'
        })
      )
    }

    // Return success response
    return NextResponse.json(
      createApiResponse({
        valid: true,
        key: {
          id: keyData.id,
          name: keyData.name,
          type: keyData.type,
          usage: keyData.usage,
          rate_limit: keyData.rate_limit
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