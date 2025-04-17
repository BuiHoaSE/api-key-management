import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createApiResponse } from '@/utils/api-response';
import type { UpdateApiKeyDto } from '@/types/api-key';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { status: 401 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch API key',
          details: error.message
        }),
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'NOT_FOUND',
          message: 'API key not found'
        }),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(data));
  } catch (error) {
    console.error('Error in GET /api/v1/keys/[id]:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateApiKeyDto;
    if (!body.name) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'VALIDATION_ERROR',
          message: 'Name is required'
        }),
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        name: body.name,
        type: body.type,
        description: body.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'DATABASE_ERROR',
          message: 'Failed to update API key',
          details: error.message
        }),
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'NOT_FOUND',
          message: 'API key not found'
        }),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(data));
  } catch (error) {
    console.error('Error in PUT /api/v1/keys/[id]:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { status: 401 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'DATABASE_ERROR',
          message: 'Failed to delete API key',
          details: error.message
        }),
        { status: 500 }
      );
    }

    return NextResponse.json(createApiResponse({ success: true }));
  } catch (error) {
    console.error('Error in DELETE /api/v1/keys/[id]:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }),
      { status: 500 }
    );
  }
} 