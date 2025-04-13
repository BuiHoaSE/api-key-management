import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure we always return an array
    return NextResponse.json(apiKeys || []);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    // Generate a unique API key in the format: tvly-{timestamp}{random}
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 12); // Get 10 random chars
    const key = `tvly-${timestamp}${random}`;
    
    // Calculate expiration date if provided
    const expiresAt = body.expiresIn 
      ? new Date(Date.now() + body.expiresIn * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          name: body.name,
          description: body.description || '',
          key: key,
          type: 'dev',
          usage: 0,
          expires_at: expiresAt
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 