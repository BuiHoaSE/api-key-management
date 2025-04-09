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
    const { id } = params;
    const body = await request.json();
    
    // Calculate new expiration date if provided
    const updates = {
      name: body.name,
      description: body.description
    };

    if (body.expiresIn) {
      updates.expires_at = new Date(Date.now() + body.expiresIn * 24 * 60 * 60 * 1000).toISOString();
    }
    
    const { data, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 