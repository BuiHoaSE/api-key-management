import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createApiResponse, ApiException } from '@/utils/api-response';
import type { ApiKey, UpdateApiKeyDto } from '@/types/api-key';
import { PostgrestError } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new ApiException('AUTH_ERROR', 'Unauthorized', 401);
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new ApiException('DATABASE_ERROR', 'Failed to fetch API key', 500, error.message);
  }

  if (!data) {
    throw new ApiException('NOT_FOUND', 'API key not found', 404);
  }

  return NextResponse.json(createApiResponse(data));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new ApiException('AUTH_ERROR', 'Unauthorized', 401);
  }

  const body = await request.json() as UpdateApiKeyDto;
  if (!body.name) {
    throw new ApiException('VALIDATION_ERROR', 'Name is required', 400);
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
    throw new ApiException('DATABASE_ERROR', 'Failed to update API key', 500, error.message);
  }

  if (!data) {
    throw new ApiException('NOT_FOUND', 'API key not found', 404);
  }

  return NextResponse.json(createApiResponse(data));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new ApiException('AUTH_ERROR', 'Unauthorized', 401);
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) {
    throw new ApiException('DATABASE_ERROR', 'Failed to delete API key', 500, error.message);
  }

  return NextResponse.json(createApiResponse({ success: true }));
} 