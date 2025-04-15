import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Reference to the mock data from the parent route
let mockApiKeys = [
  {
    id: '1',
    name: 'Development Key',
    key: 'dev_key_123456789',
    type: 'dev',
    usage: 0
  },
  {
    id: '2',
    name: 'Production Key',
    key: 'prod_key_987654321',
    type: 'prod',
    usage: 5
  }
];

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    // Validate input
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Update the API key
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        name: body.name,
        type: body.type
      })
      .eq('name', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update API key' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('name', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 