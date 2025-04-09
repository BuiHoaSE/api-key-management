import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { apiKey } = body;

    // Validate input
    if (!apiKey) {
      return NextResponse.json(
        { valid: false, message: 'API key is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Query the database
    const { data, error } = await supabase
      .from('api_keys')
      .select('id')
      .eq('key', apiKey)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no match

    // Handle database error
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { valid: false, message: 'Error validating API key' },
        { status: 500 }
      );
    }

    // Return validation result
    return NextResponse.json({
      valid: !!data,
      message: data ? 'API key is valid' : 'API key not found'
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
} 